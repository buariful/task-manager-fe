import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { pdfjs, Document, Page } from "react-pdf";

import { useSearchParams } from "react-router-dom";
import { NavBar } from "Components/NavBar";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./RenderPdf.css";
import MkdSDK from "Utils/MkdSDK";
import { InteractiveButton } from "Components/InteractiveButton";
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

// function highlightPattern(text, pattern) {
//   const regex = new RegExp(pattern, "gi"); // 'gi' for global and case insensitive
//   let count = 0;
//   const highlightedText = text.replace(regex, (value) => {
//     count++;
//     return `<mark>${value}</mark>`;
//   });
//   return { highlightedText, count };
// }

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
  const inputRef = useRef(null);

  const openBrowserSearch = () => {
    inputRef.current.focus();
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + pagesPerPage, numPages));
  };

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - pagesPerPage, 1));
  };

  const handleCheckPassword = async () => {
    setLoading(true);
    try {
      const pdfUrl = atob(pdfSecret);
      const result = await sdk.checkPdfPassword(password, pdfUrl);
      result.isValid
        ? setFile(pdfUrl)
        : showToast(globalDispatch, result?.message, 4000, "error");
    } catch (error) {
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setLoading(false);
  };

  // checkPdfPassword
  useEffect(() => {
    try {
      const secret = searchParams.get("secret");
      const election_id = searchParams.get("election_id");
      const user_id = searchParams.get("user_id");

      if (secret) {
        // const url = atob(secret);
        // setFile(url);
        setPdfSecret(secret);
      }
    } catch (error) {}
  }, []);

  return (
    <div>
      {file ? (
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

              <div
                className="Example__container__document"
                ref={setContainerRef}
              >
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
      ) : (
        <aside
          className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center "
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: "1000",
          }}
        >
          <section className="flex w-[25rem] min-w-[25rem]  flex-col gap-6 rounded-[.5rem] bg-white px-6 py-6">
            <div className="flex justify-center text-center">
              <h4>Please enter the password provided in your email.</h4>
            </div>

            <div>
              <label className="mb-2 block cursor-pointer text-sm font-[400]">
                Password
              </label>
              <input
                type={"text"}
                placeholder={"*******"}
                onChange={(e) => setPassword(e.target.value)}
                className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none`}
              />
            </div>

            <div className="flex justify-center">
              <InteractiveButton
                disabled={loading}
                loading={loading}
                className={`flex h-[2.75rem] w-[10.375rem] items-center justify-center gap-x-5 rounded-[.5rem] border border-purple-500 bg-purple-500  text-white transition-all hover:border-[#692E95] hover:bg-[#692E95]`}
                onClick={handleCheckPassword}
              >
                Submit
              </InteractiveButton>
            </div>
          </section>
        </aside>
      )}
    </div>
  );
}
