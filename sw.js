// Change this to your repository name
var GHPATH = '/digits';
 
// Choose a different app prefix name
var APP_PREFIX = 'digits_';
 
// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_00';
 
// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/fonts/bootstrap-icons.woff`,
  `${GHPATH}/fonts/bootstrap-icons.woff2`,
  `${GHPATH}/android-chrome-192x192.png`,
  `${GHPATH}/android-chrome-512x512.png`,
  `${GHPATH}/apple-touch-icon.png`,
  `${GHPATH}/bootstrap-icons.css`,
  `${GHPATH}/bootstrap.min.css`,
  `${GHPATH}/bootstrap.min.js`,
  `${GHPATH}/cookie.js`,
  `${GHPATH}/favicon-16x16.png`,
  `${GHPATH}/favicon-32x32.png`,
  `${GHPATH}/favicon.ico`,
  `${GHPATH}/index.html`,
  `${GHPATH}/jquery-3.6.4.min.js`,
  `${GHPATH}/main.css`,
  `${GHPATH}/main.js`,
  `${GHPATH}/site.webmanifest`,
  `${GHPATH}/utils.js`,
]