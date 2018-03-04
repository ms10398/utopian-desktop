#!/usr/bin/env electron

const path = require('path');
const electron = require('electron');
const WindowStateKeeper = require('electron-window-state');

const {app, BrowserWindow} = electron;

const tray = require('./tray');

// Globally declaring mainWindow and tray to prevent it from being garbage collected.
let mainWindow;
let trayIcon;
let closing;

// Adds debug features like hotkeys for triggering dev tools and reload.
require('electron-debug')();

// This is the main URL which will be loaded into our app.
const mainURL = 'file://' + path.join(__dirname, '../renderer', 'index.html');

const APP_ICON = path.join(__dirname, '../resources', 'icon');

const iconPath = () => {
	if(process.platform === 'darwin')
		return APP_ICON + '.icns';
	return APP_ICON + (process.platform === 'win32' ? '.ico' : '.png');
};

function onTrayToggle() {
	mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
}

function onTrayClose() {
	closing = true;
	mainWindow.close();
}

function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	app.quit();
}

// A function to create a new BrowserWindow.
function createMainWindow() {
	// Default main window state
	const mainWindowState = new WindowStateKeeper({
		defaultWidth: 1080,
		defaultHeight: 700
	});

	const win = new BrowserWindow({
		// Creating a new window
		title: 'Utopian Desktop',
		icon: iconPath(),
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		minWidth: 600,
		minHeight: 500,
		webPreferences: {
			plugins: true,
			allowDisplayingInsecureContent: true,
			nodeIntegration: true
		},
		show: false,
		autoHideMenuBar: true
	});

	win.on('focus', () => {
		win.webContents.send('focus');
	});

	win.once('ready-to-show', () => {
		win.show();
	});

	win.on('closed', onClosed);

	win.loadURL(mainURL);
	// Let mainWindowState update listeners automatically on main window.
	mainWindowState.manage(win);

	return win;
}

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

if(process.platform === 'darwin')
	app.dock.setIcon(`${APP_ICON}.png`)
// Triggers when the app is ready.
app.on('ready', () => {
	closing = false;
	// Assigning the globally declared mainWindow
	mainWindow = createMainWindow();

	// Initializing trayIcon
	trayIcon = tray.create(onTrayToggle, onTrayClose);

	// Grabbing the DOM
	const page = mainWindow.webContents;

	// Display web-content when DOM has loaded
	page.on('dom-ready', () => {
		mainWindow.show();
	});
});

app.on('window-all-closed', app.quit);
app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});
