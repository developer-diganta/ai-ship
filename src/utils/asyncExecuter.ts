import { exec } from 'child_process';
import util from 'util';

export default util.promisify(exec);
