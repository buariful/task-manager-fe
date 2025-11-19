import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { pdfjs, Document, Page } from "react-pdf";

import { useSearchParams } from "react-router-dom";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./publicViewPdf.css";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "Context/Global";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const sdk = new MkdSDK();

export default function Sample() {
  const [file, setFile] = useState("");
  const [numPages, setNumPages] = useState();
  const [containerRef, setContainerRef] = useState(null);
  const [containerWidth, setContainerWidth] = useState();
  const [searchText, setSearchText] = useState("");
  const [textContents, setTextContents] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfSecret, setPdfSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const pagesPerPage = 20;
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const resizeObserverOptions = {};

  const maxWidth = 800;
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
  function onChange(event) {
    setSearchText(event.target.value);
  }

  const onResize = useCallback((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onFileChange(event) {
    const { files } = event.target;

    if (files && files[0]) {
      setFile(files[0] || null);
    }
  }

  const onDocumentLoadSuccess = async ({ numPages }) => {
    setNumPages(numPages);
    const tracking_id = searchParams.get("tracking_id");

    if (tracking_id) {
      await sdk.ballotTrackingUpdate2(tracking_id);
    }
  };

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

  useEffect(() => {
    try {
      const secret = searchParams.get("secret");

      if (secret) {
        const url = atob(secret);
        setFile(url);
      }
    } catch (error) {}
  }, []);

  return (
    <div>
      <div className="Example min-h-screen bg-[#525659]">
        <div className="Example__container">
          <div className="h-full w-full">
            <div className="fixed left-0 top-0 z-50 w-full  bg-[#525659] py-2">
              <p className="mb-[2px] text-center text-sm text-white">
                Use Ctrl+F to search for your name
              </p>
              <div className="flex w-full items-center justify-center gap-5">
                <button
                  className="rounded bg-white px-5 py-1 text-sm disabled:cursor-not-allowed disabled:bg-gray-400"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="rounded bg-white px-5 py-1 text-sm disabled:cursor-not-allowed disabled:bg-gray-400"
                  onClick={handleNext}
                  disabled={currentPage + pagesPerPage > numPages}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="Example__container__document" ref={setContainerRef}>
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                options={options}
              >
                {numPages &&
                  Array.from(
                    new Array(
                      Math.min(pagesPerPage, numPages - currentPage + 1)
                    ),
                    (el, index) => (
                      <Page
                        key={`page_${currentPage + index}`}
                        pageNumber={currentPage + index}
                        width={
                          containerWidth ? Math.min(containerWidth, 800) : 800
                        }
                        customTextRenderer={textRenderer}
                        renderTextLayer={true}
                        onGetTextSuccess={handleGetTextSuccess}
                      />
                    )
                  )}
              </Document>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
