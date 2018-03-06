import api  from './server/api.js';
import startup from './server/startup.js';

startup.initialize()
.then(api.init);