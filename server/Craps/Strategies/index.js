import {ThreePointMolly} from './Molly.js'
import {ThreePointNoMolly} from './NoMolly.js'
import {IronCross} from './Cross.js'
import {InsidePressCome} from './ComePlace.js'
import {ComePressPlace} from './ComePressPlace.js'
import {PassDontPass} from './PassDontPass.js'
import {InsideBets} from './InsideBets.js'
import {AcrossHedge} from './AcrossHedge.js'
function exportToGlobal(global) {
  global.ThreePointMolly = ThreePointMolly;
  global.ThreePointNoMolly = ThreePointNoMolly;
  global.IronCross = IronCross;
  global.InsidePressCome = InsidePressCome;
  global.PassDontPass = PassDontPass;
  global.AcrossHedge = AcrossHedge;
  global.InsideBets = InsideBets;
  global.ComePressPlace = ComePressPlace;
}

// Export the classes for node.js use.
if (typeof exports !== 'undefined') {
  exportToGlobal(exports);
}

// Add the classes to the window for browser use.
if (typeof window !== 'undefined') {
  exportToGlobal(window);
}