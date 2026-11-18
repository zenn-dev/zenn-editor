export const MAX_AUDIO_BYTES = 640 * 1024;
const MAX_AUDIO_SECONDS = 30;
// サーバーは31,000msまで許容する。変換済みのm4aはこの範囲ならそのまま送信する
const MAX_PASSTHROUGH_SECONDS = 31;
// 30秒で約480KBになり、640KBの上限に収まる
const AAC_BITRATE = 128_000;

const FFMPEG_EXAMPLE =
  'ffmpeg -i input.mp3 -t 30 -c:a aac -b:a 128k output.m4a（640KBに収めるには30秒で約160kbps以下）';

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
 * 条件を満たすm4aはそのまま返し、非圧縮PCM（WAVなど）は先頭30秒をAACへ変換する。
 * Node.jsにはMP3などの圧縮音声のデコーダーがないため、それらは変換できない
 */
export async function prepareAudioForUpload(
  source: Uint8Array
): Promise<PreparedAudio> {
  // 起動を遅くしないよう、音声を扱うときだけ読み込む
  const {
    ALL_FORMATS,
    BufferSource,
    BufferTarget,
    canEncodeAudio,
    Conversion,
    Input,
    Mp4OutputFormat,
    Output,
  } = await import('mediabunny');

  const unsupported = new AudioInputError(
    `WAV（非圧縮PCM）またはm4a（AAC）の音声を指定してください。MP3などはCLIで変換できないため、先に変換してください。例: ${FFMPEG_EXAMPLE}`
  );

  const input = new Input({
    formats: ALL_FORMATS,
    source: new BufferSource(source),
  });
  let track;
  let duration: number;
  let hasVideo: boolean;
  let decodable: boolean;
  try {
    track = await input.getPrimaryAudioTrack();
    hasVideo = (await input.getVideoTracks()).length > 0;
    duration = await input.computeDuration();
    decodable = track ? await track.canDecode() : false;
  } catch {
    throw unsupported;
  }
  if (hasVideo) {
    throw new AudioInputError('動画を含むファイルは音声として指定できません');
  }
  if (!track || !Number.isFinite(duration) || duration <= 0) throw unsupported;

  if (isMp4Container(source) && track.codec === 'aac') {
    if (
      source.length <= MAX_AUDIO_BYTES &&
      duration <= MAX_PASSTHROUGH_SECONDS
    ) {
      return {
        bytes: source,
        contentType: 'audio/mp4',
        converted: false,
        trimmed: false,
      };
    }
    throw new AudioInputError(
      `m4aは30秒以内・640KB以下にしてください。CLIではm4aを再圧縮できません。例: ${FFMPEG_EXAMPLE}`
    );
  }
  if (!decodable) throw unsupported;

  let bytes: Uint8Array;
  try {
    if (!(await canEncodeAudio('aac'))) {
      const { registerAacEncoder } = await import('@mediabunny/aac-encoder');
      registerAacEncoder();
    }
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({
      input,
      output,
      trim: { start: 0, end: Math.min(duration, MAX_AUDIO_SECONDS) },
      audio: { codec: 'aac', bitrate: AAC_BITRATE },
    });
    if (!conversion.isValid) throw new Error();
    await conversion.execute();
    if (!output.target.buffer) throw new Error();
    bytes = new Uint8Array(output.target.buffer);
  } catch {
    throw new AudioInputError(
      `音声をAAC（m4a）へ変換できませんでした。先に変換してから指定してください。例: ${FFMPEG_EXAMPLE}`
    );
  }
  if (!bytes.length || bytes.length > MAX_AUDIO_BYTES) {
    throw new AudioInputError(
      `変換後の音声が640KBを超えました。先に変換してから指定してください。例: ${FFMPEG_EXAMPLE}`
    );
  }
  return {
    bytes,
    contentType: 'audio/mp4',
    converted: true,
    trimmed: duration > MAX_AUDIO_SECONDS,
  };
}
