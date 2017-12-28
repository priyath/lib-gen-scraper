//cript by Priyath G to download books from lib gen
const libgen = require('libgen');
const fs = require('fs');
const request = require('request');
const linkscrape = require('linkscrape');
const progress = require('request-progress');
const log = require('single-line-log').stdout;
const keys = require('./keys');

let retrievedTitleCount=0;
let server;
let keywordsList = [];
let booksInfo = [];
let downloadedTitles = {};
let previouslyDownloadedTitles = {};
let globalCounter = 0;

//read and load keywords from text file
const readKeywordList = () => {
  fs.readFile(keys.keywords, 'utf8', function(err, data) {
    let rows = data.split("\n");
    //iterate each line and read book list to memory
    for (let line = 0; line < rows.length; line++){
    	if (/\S/.test(rows[line])) {
      		keywordsList.push(rows[line]);
  		}
    }
    //read and load previously downloaded books from text file
    fs.readFile(keys.downloads, 'utf8', function(err, data){
      let rows = data.split("\n");
      for (let line = 0; line < rows.length; line++) {
        previouslyDownloadedTitles[rows[line]] = true;
      }
      bestMirror();
    });
  });
};

//select fastest mirror site
const bestMirror = () => {
  libgen.mirror(function(err,urlString){
    if (err)
      return console.error(err);
    server = urlString;
    console.log('Setting mirror site to: ' + urlString);
    iterateKeywords(0);
  });
};

const iterateKeywords = (x) => {
  if (x < keywordsList.length) {
    let options = getOptions(x);
    console.log('Retrieving download links for the latest ' + options.count + ' books for the keyword: ' + keywordsList[x]);
    libgen.search(options, (err, data) => {
      if (err)
        return console.error(err);
      retrievedTitleCount = data.length;
      console.log(retrievedTitleCount + ' links retrieved');
      booksInfo = data;
      globalCounter=x;
      iterateTitles(0);
    });
  } else {
    console.log("All keywords have been processed");
  }
};

const iterateTitles = (x) => {
  if (x < retrievedTitleCount) {
    let downloadUrl = 'http://libgen.io/get.php?md5=' + booksInfo[x].md5.toLowerCase();
    downloadFile(downloadUrl, x);
  } else {
  	console.log('All titles retrieved for keyword: ' + keywordsList[globalCounter]);
    console.log('---------------------------------');
    iterateKeywords(globalCounter+1);
  }
};

const downloadFile = (url,x) => {
  let title = booksInfo[x].title.replace(/\//g, "");
  if (!downloadedTitles.hasOwnProperty(title) && !previouslyDownloadedTitles.hasOwnProperty(title)) {
    console.log((x+1) + '/' + booksInfo.length + ' downloading ' + title);
    let filesize = bytesToSize(booksInfo[x].filesize);
    request(url, function (error, response, body) {
      linkscrape('url', body, function (links, $) {

        if (links[1]) {
          let completeUrl = links[1].href;

          progress(request(completeUrl), {})
          .on('progress', function (state) {
            log('file size: ' + filesize + ' | total downloaded: ' + Math.round((state.size.transferred / 1000000) * 100) / 100, 'MB | speed: ' + Math.round((state.speed / 1000) * 100) / 100 + ' KB/s');
          })
          .on('error', function (err) {
            console.log('error when downloading book. ' + err);
            iterateTitles(x + 1);
          })
          .on('end', function () {
            fs.appendFile(keys.downloads, title + '\n', function (err) {
              if (err) throw err;
              console.log('');
              downloadedTitles[title]=true;
              iterateTitles(x + 1);
            });
          })
          .pipe(fs.createWriteStream('dist/' + title));
        } else {
          console.log('Failed to retrieve download url');
          iterateTitles(x+1);
        }
      });
    });
  } else {
    console.log((x+1) + '/' + booksInfo.length + ' ' + title + ' has already been downloaded');
    iterateTitles(x+1);
  }
};

function bytesToSize(bytes) {
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

const getOptions = (x)=>{
  return {
    mirror: 'http://gen.lib.rus.ec',
    query: keywordsList[x],
    count: keys.count,
    sort_by: 'year',
    reverse: true
  };
};

readKeywordList();
