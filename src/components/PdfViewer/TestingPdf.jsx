// import React, { useCallback, useState } from "react";
// import { pdfjs, Document, Page } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";
// import "./RenderPdf.css";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();
// const options = {
//   cMapUrl: "/cmaps/",
//   standardFontDataUrl: "/standard_fonts/",
// };

// export default function TestingPdf() {
//   const url =
//     "https://s3.us-east-2.amazonaws.com/com.mkdlabs.images/22cb6156-94b4-4432-9736-e058a3d2c586/output.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZI2LF5M65PGWCXWQ%2F20240517%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240517T174621Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=cc3d1b6851f124f6964fb8681f329ac2d46432318fded7687e3eb2d8bb102d24";
//   const pagesPerPage = 10;

//   const [numPages, setNumPages] = useState();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [containerWidth, setContainerWidth] = useState();
//   const [searchText, setSearchText] = useState("");
//   const [textContents, setTextContents] = useState("");

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages);
//   };

//   function highlightPattern(text, pattern) {
//     const regex = new RegExp(pattern, "gi");
//     const searchResult = text.replace(regex, (value) => {
//       return `<mark>${value}</mark>`;
//     });

//     return searchResult;
//   }

//   const textRenderer = useCallback(
//     (textItem) => highlightPattern(textItem.str, searchText),
//     [searchText]
//   );
//   const handleGetTextSuccess = (text) => {
//     const extractedText = text.items.map((item) => item.str).join("\n");
//     setTextContents((prevText) => prevText + extractedText);
//   };

//   return (
//     <div>
//       <Document
//         file={url}
//         onLoadSuccess={onDocumentLoadSuccess}
//         options={options}
//       >
//         {Array.from(
//           new Array(Math.min(pagesPerPage, numPages - currentPage + 1)),
//           (el, index) => (
//             <Page
//               key={`page_${currentPage + index}`}
//               pageNumber={currentPage + index}
//               width={containerWidth ? Math.min(containerWidth, 800) : 800}
//               customTextRenderer={textRenderer}
//               renderTextLayer={true}
//               onGetTextSuccess={handleGetTextSuccess}
//             />
//           )
//         )}
//       </Document>
//     </div>
//   );
// }

import React, { useCallback, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./RenderPdf.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

export default function TestingPdf() {
  const url =
    " https://s3.us-east-2.amazonaws.com/com.mkdlabs.images/baas/staci_j/045401520014TNDavidson_2022General_rev+7+FINAL+%28no+WM+cropped%29%5B1%5D.pdf";
  const pagesPerPage = 10;

  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const [searchText, setSearchText] = useState("");
  const [textContents, setTextContents] = useState("");

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  function highlightPattern(text, pattern) {
    const regex = new RegExp(pattern, "gi");
    const searchResult = text.replace(regex, (value) => {
      return `<mark>${value}</mark>`;
    });

    return searchResult;
  }

  const textRenderer = useCallback(
    (textItem) => highlightPattern(textItem.str, searchText),
    [searchText]
  );

  const handleGetTextSuccess = (text) => {
    const extractedText = text.items.map((item) => item.str).join("\n");
    setTextContents((prevText) => prevText + extractedText);
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + pagesPerPage, numPages));
  };

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - pagesPerPage, 1));
  };

  return (
    <div>
      {/* <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
      >
        {numPages &&
          Array.from(
            new Array(Math.min(pagesPerPage, numPages - currentPage + 1)),
            (el, index) => (
              <Page
                key={`page_${currentPage + index}`}
                pageNumber={currentPage + index}
                width={containerWidth ? Math.min(containerWidth, 800) : 800}
                customTextRenderer={textRenderer}
                renderTextLayer={true}
                onGetTextSuccess={handleGetTextSuccess}
              />
            )
          )}
      </Document> */}
      <div className="pagination-buttons">
        <button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage + pagesPerPage > numPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
