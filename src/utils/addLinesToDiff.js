const addLinesToDiff = (diffs) => {
  return diffs.map((diff) => {
    const lines = diff.diff.split("\n");
    let oldLineNumber = 0;
    let newLineNumber = 0;
    const processedLines = lines.map((line) => {
      if (line.startsWith("@@")) {
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          oldLineNumber = parseInt(match[1], 10) - 1;
          newLineNumber = parseInt(match[2], 10) - 1;
        }
        return { line, oldLineNumber: "...", newLineNumber: "..." };
      }

      if (line.startsWith("-")) {
        oldLineNumber++;
        return { line, oldLineNumber, newLineNumber: " " };
      }

      if (line.startsWith("+")) {
        newLineNumber++;
        return { line, oldLineNumber: " ", newLineNumber };
      }

      if (!line.includes("No newline at end of file")) {
        oldLineNumber++;
        newLineNumber++;
      }

      return { line, oldLineNumber, newLineNumber };
    });

    return processedLines
      .map(({ line, oldLineNumber, newLineNumber }) =>
        JSON.stringify({
          oln: oldLineNumber,
          nln: newLineNumber,
          line,
        })
      )
      .join("\n");
  });
};

export default addLinesToDiff;

//const addFileContextToDiffWithLines = async (projectId,diffs,ref) => {
//const files = await Promise.all(diffs.map(diff => gitlabService.getFile(projectId,diff.new_path,ref)));

//const filesContent = files.map(file => getFileContent(file.content));

// const diffWithLines = addLinesToDiff(diffs);

// const diffWithLinesAndContent = filesContent.map((content, index) => `${content}\n\n\n${diffWithLines[index]}`);

//return 'hi' ;
//};

//console.log(await addFileContextToDiffWithLines('62971182',diffs,'add-contact'));
