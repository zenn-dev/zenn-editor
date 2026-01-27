import LogoSvg from '../public/logo.svg?react';

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

export const Logo: React.FC<Props> = ({
  width = 150,
  height = 20,
  className,
}) => {
  return (
    <LogoSvg
      width={width}
      height={height}
      className={className}
      aria-label="Zenn Editor"
    />
  );
};
