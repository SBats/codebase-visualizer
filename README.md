# Codebase Visualizer

## Scripts
**Get HTML children**

For a given `FolderPath`, parse all html files in this folder and its sub-folders, and extract all html elements.

Command:
``` bash
npm run html-children -- $FOLDER_PATH
```

Output:
``` json
[
    {
        "tagName": string,
        "className": string
    }
]
```
