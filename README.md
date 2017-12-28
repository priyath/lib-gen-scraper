Steps to Configure and execute the tool

==Initial Configuration==

1. Verify your environment has Node and npm installed

2. execute the command "npm install" inside the project directory to add all the required dependencies

3. Add the required search keywords to the books.txt file, one keyword per line

4. Set the count variable in keys.js to configure the number of search results that will be retrieved per keyword.
    eg: 1000 will retrieve 1000 results per keyword

==Tool Execution==

1. Run the tool by executing the command "node scrape.js"

2. The tool will iterate the keyword list, retrieve the specified number of download links and download the PDF files. This will happen synchronously

3. The PDF files will be saved in the 'dist' directory

==downloadlist.txt==

This file contains a list of all the PDFs that has been downloaded. This list ensures no duplicate downloads will takes place

==Troubleshooting==

When downloading a large number of files (around 1000) there is a possibility for a download to fail or freeze.
If this happens, please re-run the tool. The already downloaded files will be available in the 'dist' directory and the downloadlist.txt
will ensure the download process will resume from where it stopped initially.

To download specific titles, just add the title to the books.txt file and run the tool




