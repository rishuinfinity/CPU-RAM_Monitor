/*
* Name: CPU-RAM Monitor
* Description: Extension to Monitor CPU and RAM Usage minimally.
* Author: Rishu Raj
* Modified from: Simple System Monitor by LGiki
*/

const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib  = imports.gi.GLib;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ByteArray = imports.byteArray;

let lastCPUUsed = 0;
let lastCPUTotal = 0;
const refreshTime = 1.0; // Set refresh time to one second.
let settings;
let container, timeout;
let home_dir = GLib.get_home_dir();
let logSize = 8000; // about 8k

// See <https://stackoverflow.com/a/9229580>.
const getCurrentCPUUsage = () => {
  let currentCPUUsage = 0;
  try {
      const inputFile = Gio.File.new_for_path('/proc/stat');
      const fileInputStream = inputFile.read(null);
      const dataInputStream = new Gio.DataInputStream({
          'base_stream': fileInputStream
      });

      let currentCPUUsed = 0;
      let currentCPUTotal = 0;
      let line = null;

      while (([line, length] = dataInputStream.read_line(null)) && line != null) {
          if (line instanceof Uint8Array) {
              line = ByteArray.toString(line).trim();
          } else {
              line = line.toString().trim();
          }

          const fields = line.split(/\W+/);

          if (fields.length < 2) {
              continue;
          }

          const itemName = fields[0];
          if (itemName == 'cpu' && fields.length >= 5) {
              const user = Number.parseInt(fields[1]);
              const system = Number.parseInt(fields[3]);
              const idle = Number.parseInt(fields[4]);
              currentCPUUsed = user + system;
              currentCPUTotal = user + system + idle;
              break;
          }
      }
      fileInputStream.close(null);
      // Avoid divide by zero
      if (currentCPUTotal - lastCPUTotal !== 0) {
          currentCPUUsage = (currentCPUUsed - lastCPUUsed) / (currentCPUTotal - lastCPUTotal);
      }
      lastCPUTotal = currentCPUTotal;
      lastCPUUsed = currentCPUUsed;
  } catch (e) {
    saveExceptionLog(e);
  }
  currentCPUUsage = String(Math.round(currentCPUUsage * 100));
  return currentCPUUsage;
}

const getCurrentMemoryUsage = () => {
  let currentMemoryUsage = 0;
  try {
      const inputFile = Gio.File.new_for_path('/proc/meminfo');
      const fileInputStream = inputFile.read(null);
      const dataInputStream = new Gio.DataInputStream({
          'base_stream': fileInputStream
      });
      let memTotal = -1;
      let memAvailable = -1;
      let line = null;
      while (([line, length] = dataInputStream.read_line(null)) && line != null) {
          if (line instanceof Uint8Array) {
              line = ByteArray.toString(line).trim();
          } else {
              line = line.toString().trim();
          }
          const fields = line.split(/\W+/);
          if (fields.length < 2) {
              break;
          }
          const itemName = fields[0];
          const itemValue = Number.parseInt(fields[1]);

          if (itemName == 'MemTotal') {
              memTotal = itemValue;
          }
          if (itemName == 'MemAvailable') {
              memAvailable = itemValue;
          }
          if (memTotal !== -1 && memAvailable !== -1) {
              break;
          }
      }

      fileInputStream.close(null);

      if (memTotal !== -1 && memAvailable !== -1) {
          const memUsed = memTotal - memAvailable;
          currentMemoryUsage = memUsed / memTotal;
      }
  } catch (e) {
    saveExceptionLog(e);
  }
  currentMemoryUsage = String(Math.round(currentMemoryUsage * 100));
  return currentMemoryUsage;
}

function getMonitor() {
  try {
    finaltext = ""
    if(settings.get_boolean("show-cpu")){
      finaltext = finaltext + getCurrentCPUUsage()+"C ";
    }
    if(settings.get_boolean("show-ram")){
      finaltext = finaltext + getCurrentMemoryUsage() + "R";
    }
    Monitor.set_text(finaltext);
  } catch(e) {
    Monitor.set_text( " " + e);
    saveExceptionLog(e);
  }
  return true;
}

function saveExceptionLog(e){
  let log_file = Gio.file_new_for_path( 
    home_dir + '/.local/var/log/CPU-RAM_Monitor.log' );

  let log_file_size =  log_file.query_info( 
    'standard::size', 0, null).get_size();
  
  if( log_file_size > logSize ){
    log_file.replace( null,false, 0, null ).close(null);
  }
  e += Date()+':\n' + e;
  let logOutStream = log_file.append_to( 1, null );
  logOutStream.write( e, null );
  logOutStream.close(null);

}

function init() {

}

function enable() {
  container = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: false,
    x_expand: true,
    y_expand: false,
    track_hover: false
  });
  Monitor = new St.Label({
    text: "0C 0R" ,
    style_class: 'MonitorLabel',
    y_align: Clutter.ActorAlign.CENTER
  });
  container.set_child(Monitor);
  settings = ExtensionUtils.getSettings(
    'org.gnome.shell.extensions.CPU-RAM_Monitor');
  // Positioning and Starting the extension
  if(settings.get_boolean('pos-left')){
    Main.panel._leftBox.insert_child_at_index(container, 20);
  }else{
    Main.panel._rightBox.insert_child_at_index(container, 0);
  }
  timeout = Mainloop.timeout_add_seconds(refreshTime, getMonitor);
}

function disable() {
  Mainloop.source_remove(timeout);
  Main.panel._leftBox.remove_child(container);
  container.destroy();
  container = null;
  settings = null;
}
