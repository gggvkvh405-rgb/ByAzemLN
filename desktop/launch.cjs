function launchArgs(args=[]){
  if(!Array.isArray(args)||args.length>64||args.some(arg=>typeof arg!=='string'||arg.length>2048||/[\0\r\n]/.test(arg)))throw Error('Invalid launch arguments (up to 64 lines of 2048 characters each).');
  return args.slice();
}
module.exports={launchArgs};
