const MAX_AUDIO_BYTES = 640 * 1024;
const MAX_AUDIO_SECONDS = 30;
// 変換済みのm4aは、エンコード時の端数で30秒をわずかに超えることがある
const MAX_M4A_SECONDS = 31;
// 30秒で約480KBになり、640KBの上限に収まる
const AAC_BITRATE = 128_000;

export const AUDIO_CONVERSION_HINT =
  '30秒以内のAAC（m4a）へ変換してから指定してください。例: ffmpeg -i input.mp3 -t 30 -c:a aac -b:a 128k output.m4a（640KBに収めるには30秒で約160kbps以下）';

export class AudioInputError extends Error {}

export type PreparedAudio = {
  bytes: Uint8Array;
  contentType: 'audio/mp4';
  // CLIでAAC（m4a）へ変換した場合はtrue
  converted: boolean;
  // 30秒を超える部分を切り捨てた場合はtrue
  trimmed: boolean;
};

function isMp4Container(bytes: Uint8Array) {
  return (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(4, 8)).toString('ascii') === 'ftyp'
  );
}

/**
 * 音声をアップロードできる形式（約30秒以内・640KB以下のAACのm4a）に整える。
 * 非圧縮PCM（WAV）は先頭30秒をAACへ変換し、m4aは音声を再エンコードせずに詰め替える。
 * Node.jsにはMP3などの圧縮音声のデコーダーがないため、それらは変換できない。
 *
 * どちらの経路でも、タイトルや作成者などのメタデータと音声以外のデータは出力に含めない。
 * AI scanは話されている内容を検査するため、検査されない情報を公開ファイルに残さない
 */
export async function prepareAudioForUpload(
  source: Uint8Array
): Promise<PreparedAudio> {
  // 起動を遅くしないよう、音声を扱うときだけ読み込む
  const {
    BufferSource,
    BufferTarget,
    canEncodeAudio,
    Conversion,
    Input,
    MP4,
    Mp4OutputFormat,
    Output,
    WAVE,
  } = await import('mediabunny');

  const unsupported = new AudioInputError(
    `WAV（非圧縮PCM）またはm4a（AAC）の音声を指定してください。MP3などはCLIで変換できません。${AUDIO_CONVERSION_HINT}`
  );

  // 信頼できないファイルを読むため、受け付ける形式の解析だけを有効にする
  const input = new Input({
    formats: [WAVE, MP4],
    source: new BufferSource(source),
  });
  let conversion: Awaited<ReturnType<typeof Conversion.init>> | undefined;
  try {
    let track;
    let duration: number;
    let audioTrackCount: number;
    let hasVideo: boolean;
    let decodable: boolean;
    try {
      track = await input.getPrimaryAudioTrack();
      audioTrackCount = (await input.getAudioTracks()).length;
      hasVideo = (await input.getVideoTracks()).length > 0;
      duration = await input.computeDuration();
      decodable = track ? await track.canDecode() : false;
    } catch {
      throw unsupported;
    }
    if (hasVideo) {
      throw new AudioInputError(
        '動画やカバー画像を含むファイルは音声として指定できません。音声だけのファイルを指定してください'
      );
    }
    if (!track || !Number.isFinite(duration) || duration <= 0) {
      throw unsupported;
    }
    if (audioTrackCount !== 1) {
      throw new AudioInputError(
        '音声トラックが1本だけのファイルを指定してください'
      );
    }

    const isM4a = isMp4Container(source) && track.codec === 'aac';
    if (isM4a && duration > MAX_M4A_SECONDS) {
      throw new AudioInputError(
        `m4aは30秒以内にしてください。CLIではm4aを再圧縮できません。${AUDIO_CONVERSION_HINT}`
      );
    }
    if (!isM4a && !decodable) throw unsupported;

    let bytes: Uint8Array;
    try {
      if (!isM4a && !(await canEncodeAudio('aac'))) {
        const { registerAacEncoder } = await import('@mediabunny/aac-encoder');
        registerAacEncoder();
      }
      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });
      conversion = await Conversion.init({
        input,
        output,
        tags: {},
        showWarnings: false,
        ...(isM4a
          ? {}
          : {
              trim: { start: 0, end: Math.min(duration, MAX_AUDIO_SECONDS) },
              audio: { codec: 'aac' as const, bitrate: AAC_BITRATE },
            }),
      });
      if (!conversion.isValid) throw new Error();
      await conversion.execute();
      conversion = undefined;
      if (!output.target.buffer) throw new Error();
      bytes = new Uint8Array(output.target.buffer);
    } catch {
      throw new AudioInputError(
        `音声をアップロード用のm4aへ変換できませんでした。${AUDIO_CONVERSION_HINT}`
      );
    }
    if (!bytes.length || bytes.length > MAX_AUDIO_BYTES) {
      throw new AudioInputError(
        `音声は640KB以下にしてください。${AUDIO_CONVERSION_HINT}`
      );
    }
    return {
      bytes,
      contentType: 'audio/mp4',
      converted: !isM4a,
      trimmed: !isM4a && duration > MAX_AUDIO_SECONDS,
    };
  } finally {
    // 失敗時にエンコーダーのworkerが残ると、CLIのプロセスが終了しなくなる
    await conversion?.cancel().catch(() => undefined);
    input.dispose();
  }
}
