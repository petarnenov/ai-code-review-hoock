export const decodeContent = (content) => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    return content;
  }
  try {
    return atob(content);
  } catch (e) {
    console.error("Failed to decode content:", e);
    return content;
  }
};

export const addLineNumbers = (content) => {
  return content
    .split("\n")
    .map((line, index) => `${index + 1}:  ${line}`)
    .join("\n");
};

export const addFileNameToContent = (file, content) => {
  return `new_path: ${file.file_path}
  
${content}`;
};

const processContent = (file) => {
  const decodedContent = decodeContent(file?.content);
  //const lineNumbersContent = addLineNumbers(decodedContent);
  const contentWithFilePath = addFileNameToContent(file, decodedContent);
  return contentWithFilePath;
};

export default processContent;
