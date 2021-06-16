import colors from 'colors/safe';

export function error(message: string) {
  console.error(colors.red('error:'), message);
}

export function success(message: string) {
  console.log(colors.green('success:'), message);
}

export function created(name: string) {
  console.log('created:', colors.green(name));
}

export function warn(message: string) {
  console.warn(colors.yellow('warn:'), message);
}
