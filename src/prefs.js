'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
// const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {

    // Copy the same GSettings code from `extension.js`
    this.settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.CPU-RAM_Monitor');

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        // margin: 18,
        margin_start: 40,
        margin_end: 40,  
        margin_top: 40,
        margin_bottom: 40,
        column_spacing: 20,
        row_spacing: 12,
        visible: true
    });


///////////////////////////  1st switch
    // Create a label & switch for `format`
    let showCPULabel = new Gtk.Label({
        label: '<b>Show CPU usage:</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(showCPULabel, 0, 1, 1, 1);

    let showCPUtoggle = new Gtk.Switch({
        active: this.settings.get_boolean('show-cpu'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(showCPUtoggle, 1, 1, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'show-cpu',
        showCPUtoggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

///////////////////////////  2st switch
    // Create a label & switch for `format`
    let showRAMLabel = new Gtk.Label({
        label: '<b>Show RAM usage:</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(showRAMLabel, 0, 2, 1, 1);

    let showRAMtoggle = new Gtk.Switch({
        active: this.settings.get_boolean ('show-ram'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(showRAMtoggle, 1, 2, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'show-ram',
        showRAMtoggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

///////////////////////////  3nd switch
    // Create a label & switch for `positioning`
    let positioningLabel = new Gtk.Label({
        label: '<b>Show the extension on the left side:</b> (restart the extension for changes to appear)',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(positioningLabel, 0, 3, 1, 1);

    let positioningtoggle = new Gtk.Switch({
        active: this.settings.get_boolean ('pos-left'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(positioningtoggle, 1, 3, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'pos-left',
        positioningtoggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Return our widget which will be added to the window
    return prefsWidget;
}