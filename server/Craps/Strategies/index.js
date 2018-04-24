import {ThreePointMolly} from './Molly.js'
import {ThreePointNoMolly} from './NoMolly.js'
import {IronCross} from './Cross.js'
import {InsidePressCome} from './ComePlace.js'
import {PassDontPass} from './PassDontPass.js'
function exportToGlobal(global) {
  global.ThreePointMolly = ThreePointMolly;
  global.ThreePointNoMolly = ThreePointNoMolly;
  global.IronCross = IronCross;
  global.InsidePressCome = InsidePressCome;
  global.PassDontPass = PassDontPass;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}