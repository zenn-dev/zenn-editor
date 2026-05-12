import logoSvg from '../public/logo.svg';

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
    <img
      src={logoSvg}
      width={width}
      height={height}
      className={className}
      alt="Zenn Editor"
    />
  );
};
