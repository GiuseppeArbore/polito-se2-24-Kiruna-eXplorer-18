import {
  RiShareLine,
  RiFileCopyLine,
  RiCheckDoubleLine,
  RiHome3Line,
  RiEditBoxLine,
  RiCamera2Fill,
  RiFilePdf2Fill,
  RiDeleteBinLine,
  RiAddBoxLine,
} from "@remixicon/react";
import { Button, Card, Dialog, DialogPanel } from "@tremor/react";
import {
  FormDialog,
  FormDocumentDescription,
  FormDocumentInformation,
} from "../form/Form";
import { FileUpload } from "../form/DragAndDrop";
import DeleteResourceDialog from "./DeleteResourcesDialog";
import API from "../../API";
import mime from "mime";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionList,
} from "@tremor/react";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DocumentPageMap, PreviewMap } from "../map/Map";
import { KxDocument, DocCoords } from "../../model";
import { mongoose } from "@typegoose/typegoose";
import "../../css/document.css";
import PreviewDoc from "./Preview";
import { Toast } from "@radix-ui/react-toast";
import { Toaster } from "../toast/Toaster";
import { AreaType, KxDocumentType, Scale, Stakeholders } from "../../enum";
import {
  parseLocalizedNumber,
  PageRange,
  validatePageRangeString,
} from "../../utils";
import { toast } from "../../utils/toaster";
import locales from "../../locales.json";
import exp from "constants";
import { DateRange } from "../form/DatePicker";
interface DocumentProps {
  user: { email: string; role: Stakeholders } | null;
}

interface FormDialogProps {
  documents: KxDocument[];
  refresh: () => void;
}

export default function Document({ user }: DocumentProps) {
  const formatLocalDate = (date: Date) => {
    return date.toLocaleDateString("sv-SE"); // 'sv-SE' è un formato ISO-like
  };

  const canEdit = user && user.role === Stakeholders.URBAN_PLANNER;

  const navigate = useNavigate();
  const { id } = useParams<string>();
  const [fileTitle, setFileTitle] = useState<string | undefined>(undefined);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [doc, setDoc] = useState<KxDocument | null>(null);
  const [share, setShare] = useState(false);
  const [drawings, setDrawings] = useState<any>();
  const [title, setTitle] = useState("");
  const [stakeholders, setStakeholders] = useState<string[]>([]);
  const [scale, setScale] = useState(10000);
  const [issuanceDate, setIssuanceDate] = useState<DateRange | undefined>(
    undefined
  );
  const [type, setType] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [pages, setPages] = useState<PageRange[] | undefined>(undefined);
  const [pageRanges, setPageRanges] = useState<PageRange[] | undefined>(
    undefined
  );
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [entireMunicipality, setEntireMunicipality] = useState(false);
  const [docCoordinates, setDocCoordinates] = useState<DocCoords | undefined>(
    undefined
  );
  const [documents, setDocuments] = useState<KxDocument[]>([]);
  const [documentsForDirect, setDocumentsForDirect] = useState<string[]>([]);
  const [documentsForCollateral, setDocumentsForCollateral] = useState<
    string[]
  >([]);
  const [documentsForProjection, setDocumentsForProjection] = useState<
    string[]
  >([]);
  const [documentsForUpdate, setDocumentsForUpdate] = useState<string[]>([]);
  const [saveDrawing, setSaveDrawing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmitDragAndDrop = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (files.length > 0) {
        const FileUpload = await API.addAttachmentToDocument(
          new mongoose.Types.ObjectId(id),
          files
        );
        if (!FileUpload) {
          toast({
            title: "Error",
            description: "Failed to upload files",
            variant: "error",
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "error",
        duration: 3000,
      });
    }

    files.forEach((f) => doc?.attachments?.push(f.name));
    toast({
      title: "Upload files",
      description: "Original resources updated succesfully",
      variant: "success",
      duration: 3000,
    });

    setIsDragAndDropOpen(false);
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const document = await API.getKxDocumentById(
          new mongoose.Types.ObjectId(id!)
        );
        setDoc(document);
        setTitle(document.title);
        setStakeholders(document.stakeholders);
        setScale(document.scale);
        setIssuanceDate({
          from: document.issuance_date.from,
          to: document.issuance_date.to,
        });
        setType(document.type);
        setLanguage(document.language || undefined);
        setPages(document.pages || undefined);
        setDescription(document.description || undefined);
        setDocumentsForDirect(
          document.connections.direct.map((doc) => doc._id?.toString())
        );
        setDocumentsForCollateral(
          document.connections.collateral.map((doc) => doc._id?.toString())
        );
        setDocumentsForProjection(
          document.connections.projection.map((doc) => doc._id?.toString())
        );
        setDocumentsForUpdate(
          document.connections.update.map((doc) => doc._id?.toString())
        );
        setPageRanges([]);

        if (document.doc_coordinates.type !== "EntireMunicipality") {
          function getIconForType(type: string): string {
            switch (type) {
              case "Informative Document":
                return "icon-InformativeDocument";
              case "Prescriptive Document":
                return "icon-PrescriptiveDocument";
              case "Design Document":
                return "icon-DesignDocument";
              case "Technical Document":
                return "icon-TechnicalDocument";
              case "Strategy":
                return "icon-Strategy";
              case "Agreement":
                return "icon-Agreement";
              case "Conflict Resolution":
                return "icon-ConflictResolution";
              case "Consultation":
                return "icon-Consultation";
              default:
                return "default-icon";
            }
          }

          const geoJSON = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: document.doc_coordinates,
                properties: {
                  title: document.title,
                  description: document.description,
                  id: document._id,
                  type: document.type,
                  icon: getIconForType(document.type),
                },
              },
            ],
          };
          setDrawings(geoJSON);
        } else {
          setEntireMunicipality(true);
        }
      } catch (error) {
        console.error("Failed to fetch document:", error);
        navigate("/404");
      }
    };

    fetchDocument();
  }, []);

  useMemo(async () => {
    if (drawings && saveDrawing) {
      let draw: DocCoords;
      if (
        drawings &&
        drawings.features.length === 1 &&
        drawings.features[0].geometry.type === "Point"
      ) {
        draw = {
          type: AreaType.POINT,
          coordinates: drawings.features[0].geometry.coordinates,
        };
      } else if (
        drawings &&
        drawings.features.length >= 1 &&
        drawings.features[0].geometry.type === "Polygon"
      ) {
        let cord =
          drawings.features.map((f: any) => f.geometry.coordinates).length === 1
            ? drawings.features[0].geometry.coordinates
            : [];

        draw = {
          type: AreaType.AREA,
          coordinates: cord as number[][][],
        };
      } else {
        draw = {
          type: AreaType.ENTIRE_MUNICIPALITY,
        };
      }
      try {
        const res = await API.updateKxDocumentInformation(
          id!,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          draw
        );
        if (res) {
          toast({
            title: "Success",
            description: "The document has been updated successfully",
            variant: "success",
            duration: 3000,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update document",
            variant: "error",
            duration: 3000,
          });
        }
      } catch (error) {}
      setSaveDrawing(false);
    }
  }, [saveDrawing]);

  const [showCheck, setShowCheck] = useState(false);
  const [deleteOriginalResourceConfirm, setDeleteOriginalResourceConfirm] =
    useState(false);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [isDragAndDropOpen, setIsDragAndDropOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-row mb-2">
        <i onClick={() => navigate("/")}>
          <RiHome3Line className="mt-1 text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong" />
        </i>
        <h1 className="text-2xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Document Page
        </h1>
      </div>
      <Card>
        <div className="flex flex-row ">
          <div className="flex flex-col items-start justify-between w-full lg:w-1/2 lg:border-r lg:border-gray-300 lg:me-6">
            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-md font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Title:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {" "}
                {title} ({id}){" "}
              </i>
            </div>

            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Stakeholders:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {stakeholders.join("/ ")}
              </i>
            </div>

            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Scale:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                1: {scale}
              </i>
            </div>

            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Issuance Date:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {" "}
                {issuanceDate?.from
                  ? formatLocalDate(new Date(issuanceDate.from))
                  : ""}
                {issuanceDate?.to
                  ? ` - ${formatLocalDate(new Date(issuanceDate.to))}`
                  : ""}
              </i>
            </div>

            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Type:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {type}{" "}
              </i>
            </div>

            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Language:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {locales.find((l) => l.code === language)?.name || "Unknown"}
              </i>
            </div>

            <div className="flex items-center justify-between mb-2 space-x-2">
              <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Pages:
              </i>
              <i className="text-md font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {" "}
                {pages != undefined && pages.toString() != ""
                  ? pages
                  : "Unknown"}{" "}
              </i>
            </div>

            <FormInfoDialog
              document={doc!}
              title={title}
              setTitle={setTitle}
              titleError={false}
              setTitleError={() => {}}
              stakeholders={stakeholders}
              setStakeholders={setStakeholders}
              shError={false}
              setShError={() => {}}
              issuanceDate={issuanceDate}
              setIssuanceDate={setIssuanceDate}
              type={type}
              setType={setType}
              scale={scale}
              setScale={setScale}
              language={language}
              setLanguage={setLanguage}
              pages={pages}
              setPages={setPages}
              pageRanges={pageRanges}
              setPageRanges={setPageRanges}
              id={id!}
              user={user}
            />
          </div>

          <div className="hidden lg:flex flex-col items-start col space-y-2 w-1/2">
            <i className="text-md font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Description:
            </i>
            <i className="text-sm font-light text-tremor-content-strong dark:text-dark-tremor-content-strong">
              {" "}
              {description}{" "}
            </i>

            <div className="hidden lg:flex space-y-2 h-full w-full">
              <FormDescriptionDialog
                document={doc!}
                description={description}
                setDescription={setDescription}
                id={id!}
                user={user}
              />
            </div>
          </div>
          <div className="flex justify-end w-full absolute right-3">
            <i onClick={() => setShare(true)}>
              <RiShareLine className="self-end text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong" />
            </i>
            <Dialog open={share} onClose={() => setShare(false)} static={true}>
              <DialogPanel>
                <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  Share "{title}"
                </h3>
                <p className="mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  Share the link of the document.
                </p>
                <div className="flex flex-row justify-between">
                  <div className="mt-4 w-full  me-2">
                    <input
                      type="text"
                      className="w-full p-2 border border-tremor-border rounded-md"
                      value={window.location.href}
                      readOnly
                    />
                  </div>

                  <Button
                    className="mt-4 w-1/6 flex flex-col items-center justify-between"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setShowCheck(true);
                      setTimeout(() => setShowCheck(false), 1500);
                    }}
                  >
                    {showCheck ? (
                      <RiCheckDoubleLine className="mr-2" />
                    ) : (
                      <RiFileCopyLine className="mr-2" />
                    )}
                  </Button>
                </div>
                <Button
                  className="mt-8 w-full secondary"
                  onClick={() => setShare(false)}
                >
                  Close
                </Button>
              </DialogPanel>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row ">
          <div className="flex w-full h-full items-center justify-between mb-2">
            <Accordion className="w-full mr-6 mb-6">
              <AccordionHeader className="text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Original Resources
              </AccordionHeader>
              <AccordionBody className="leading-6 flex flex-col">
                <AccordionList style={{ boxShadow: "none" }}>
                  {doc !== undefined &&
                  doc?.attachments &&
                  doc?.attachments.length >= 1 ? (
                    doc?.attachments?.map((title) => (
                      <div
                        key={title + doc._id}
                        className="flex items-center justify-between m-2"
                      >
                        <i className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                          {mime.getType(title)?.split("/")[1] === "pdf"
                            ? "PDF file"
                            : mime.getType(title)?.split("/")[0] === "image"
                            ? "Image file"
                            : "File  ".concat("(." + title.split(".")[1] + ")")}
                        </i>
                        <div className="flex space-x-2">
                          <Button
                            className="ml-2"
                            onClick={() => {
                              setFileTitle(title);
                              setShowPdfPreview(true);
                            }}
                          >
                            Preview File
                          </Button>
                          <Button
                            className="ml-2"
                            color="red"
                            onClick={async () => {
                              setDeleteOriginalResourceConfirm(true);
                              setFileTitle(title);
                            }}
                          >
                            <RiDeleteBinLine />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between m-2">
                        <i className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                          No original resources added
                        </i>
                      </div>
                    </>
                  )}
                </AccordionList>
              </AccordionBody>
            </Accordion>
            {canEdit && (
              <i
                className="h-full lg:mr-9 mb-5"
                onClick={() => setIsDragAndDropOpen(true)}
              >
                <RiAddBoxLine className="text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong" />
              </i>
            )}
          </div>

          <div className="hide lg:flex w-full h-full items-center justify-between mb-2 ">
            <Accordion className="w-full mr-6 mb-6">
              <AccordionHeader className="text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                More documents [Cooming soon]{" "}
              </AccordionHeader>
              <AccordionBody className="leading-6 flex flex-col">
                <AccordionList style={{ boxShadow: "none" }}>
                  <div className="flex items-center justify-between m-2">
                    <i className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                      No more documents added
                    </i>
                  </div>
                </AccordionList>
              </AccordionBody>
            </Accordion>

            <div className="hidden lg:flex">
              <Button disabled className="h-full lg:ml-3 mb-5">
                <RiAddBoxLine className="text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong" />
              </Button>
            </div>
          </div>

          {DeleteResourceDialog(
            deleteOriginalResourceConfirm,
            setDeleteOriginalResourceConfirm,
            async () => {
              try {
                await API.deleteAttachmentFromDocument(
                  new mongoose.Types.ObjectId(id!),
                  fileTitle!
                );
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to delete documents",
                  variant: "error",
                  duration: 3000,
                });
                return;
              }

              toast({
                title: "Success",
                description: "The document has been deleted successfully",
                variant: "success",
                duration: 3000,
              });

              doc!.attachments = doc?.attachments?.filter(
                (f) => f !== fileTitle
              );
              setDoc({ ...doc! });
            },
            fileTitle!
          )}

          <Dialog
            open={isDragAndDropOpen}
            onClose={() => setIsDragAndDropOpen(false)}
            static={true}
          >
            <DialogPanel>
              <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Add Original Resources
              </h3>
              <p className="mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                Add original resources about the document you are uploading.
              </p>
              <FileUpload saveFile={(list) => setFiles(list)} />
              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:space-x-4 sm:justify-end">
                <Button
                  className="w-full sm:w-auto mt-4 sm:mt-0 secondary"
                  variant="light"
                  onClick={() => setIsDragAndDropOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto primary"
                  onClick={(e) => handleSubmitDragAndDrop(e)}
                >
                  Submit
                </Button>
              </div>
            </DialogPanel>
          </Dialog>
        </div>

        <Accordion className="lg:hidden">
          <AccordionHeader className="text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Description
          </AccordionHeader>
          <AccordionBody className="leading-6 flex flex-col">
            {description}
            <FormDescriptionDialog
              document={doc!}
              description={description}
              setDescription={setDescription}
              id={id!}
              user={user}
            />
          </AccordionBody>
        </Accordion>

        {!entireMunicipality ? (
          <Card
            className={`my-4 p-0 overflow-hidden cursor-pointer ${"ring-tremor-ring"}`}
          >
            <DocumentPageMap
              setDrawing={(d) => {
                setDrawings(d);
                setSaveDrawing(true);
              }}
              drawing={drawings}
              style={{ minHeight: "300px", width: "100%" }}
              user={user}
            />
          </Card>
        ) : (
          <div className="flex justify-center items-start pt-10">
            <div className=" document-whole-municipality-style w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <span>The document covers the entire municipality</span>
              </div>
            </div>
          </div>
        )}
        {PreviewDoc(
          showPdfPreview,
          () => setShowPdfPreview(false),
          doc?._id,
          fileTitle
        )}
        <Toaster />
      </Card>
    </div>
  );
}

export function FormInfoDialog({
  document,
  title,
  setTitle,
  titleError,
  setTitleError,
  stakeholders,
  setStakeholders,
  shError,
  setShError,
  issuanceDate,
  setIssuanceDate,
  type,
  setType,
  scale,
  setScale,
  language,
  setLanguage,
  pages,
  setPages,
  pageRanges,
  setPageRanges,
  id,
  user,
}: {
  document: KxDocument;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  titleError: boolean;
  setTitleError: React.Dispatch<React.SetStateAction<boolean>>;
  stakeholders: string[];
  setStakeholders: React.Dispatch<React.SetStateAction<string[]>>;
  shError: boolean;
  setShError: React.Dispatch<React.SetStateAction<boolean>>;
  issuanceDate: DateRange | undefined;
  setIssuanceDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  type: string | undefined;
  setType: React.Dispatch<React.SetStateAction<string | undefined>>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  language: string | undefined;
  setLanguage: React.Dispatch<React.SetStateAction<string | undefined>>;
  pages: PageRange[] | undefined;
  setPages: React.Dispatch<React.SetStateAction<PageRange[] | undefined>>;
  pageRanges: PageRange[] | undefined;
  setPageRanges: React.Dispatch<React.SetStateAction<PageRange[] | undefined>>;
  id: string;
  user: { email: string; role: Stakeholders } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [typeError, setTypeError] = useState(false);

  const canEdit = user && user.role === Stakeholders.URBAN_PLANNER;

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      title === "" ||
      stakeholders.length === 0 ||
      type === undefined ||
      scale === 0
    ) {
      setError("Please fill all the fields");
      return;
    }
    try {
      const updatedDocument = await API.updateKxDocumentInformation(
        id,
        title,
        stakeholders,
        type,
        scale,
        language,
        pages
      );
      if (updatedDocument) {
        toast({
          title: "Success",
          description: "The document has been updated successfully",
          variant: "success",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update document",
          variant: "error",
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "error",
        duration: 3000,
      });
    }
    setIsOpen(false);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitle(document.title);
    setStakeholders(document.stakeholders);
    setScale(document.scale);
    setType(document.type);
    setLanguage(document.language || undefined);
    setPages(document.pages || undefined);
    setIsOpen(false);
  };

  return (
    <>
      {canEdit && (
        <i className="ml-auto self-end mb-2" onClick={() => setIsOpen(true)}>
          <RiEditBoxLine className="text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong lg:me-6" />
        </i>
      )}
      <Dialog open={isOpen} onClose={(val) => setIsOpen(val)} static={true}>
        <DialogPanel
          className="w-80vm sm:w-4/5 md:w-4/5 lg:w-3/3 xl:w-1/2"
          style={{ maxWidth: "80vw" }}
        >
          <div className="sm:mx-auto sm:max-w-2xl">
            <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Update document
            </h3>
            <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
              Update the informations about the document
            </p>
            <FormDocumentInformation
              title={title}
              setTitle={setTitle}
              titleError={titleError}
              setTitleError={setTitleError}
              stakeholders={stakeholders}
              setStakeholders={setStakeholders}
              shError={shError}
              setShError={setShError}
              issuanceDate={issuanceDate}
              setIssuanceDate={setIssuanceDate}
              type={type}
              setType={setType}
              typeError={typeError}
              setTypeError={setTypeError}
              scale={scale}
              setScale={setScale}
              language={language}
              setLanguage={setLanguage}
              pages={pages}
              setPages={setPages}
              pageRanges={pageRanges}
              setPageRanges={setPageRanges}
            />
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:space-x-4 sm:justify-end">
              <Button
                className="w-full sm:w-auto mt-4 sm:mt-0 secondary"
                variant="light"
                onClick={(e) => handleCancelSubmit(e)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto primary"
                onClick={(e) => handleInfoSubmit(e)}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}

export function FormDescriptionDialog({
  document,
  description,
  setDescription,
  id,
  user,
}: {
  document: KxDocument;
  description: string | undefined;
  setDescription: React.Dispatch<React.SetStateAction<string | undefined>>;
  id: string;
  user: { email: string; role: Stakeholders } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const canEdit = user && user.role === Stakeholders.URBAN_PLANNER;

  const handleDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description === undefined || description.length === 0) {
      setError("Please fill the description field");
      return;
    }
    try {
      const updatedDocument = await API.updateKxDocumentDescription(
        id,
        description
      );
      if (updatedDocument) {
        toast({
          title: "Success",
          description: "The description has been updated successfully",
          variant: "success",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update description",
          variant: "error",
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "error",
        duration: 3000,
      });
    }
    setIsOpen(false);
  };

  const handleDescriptionCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setDescription(document.description);
    setIsOpen(false);
  };

  return (
    <>
      {canEdit && (
        <i
          className="mb-2 w-full flex justify-end"
          onClick={() => setIsOpen(true)}
        >
          <RiEditBoxLine className="text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong" />
        </i>
      )}

      <Dialog open={isOpen} onClose={(val) => setIsOpen(val)} static={true}>
        <DialogPanel
          className="w-80vm sm:w-4/5 md:w-4/5 lg:w-3/3 xl:w-1/2"
          style={{ maxWidth: "80vw" }}
        >
          <div className="sm:mx-auto sm:max-w-2xl">
            <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Update description
            </h3>
            <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
              Update the description of the document
            </p>
            <form action="" method="patch" className="mt-8">
              <FormDocumentDescription
                description={description}
                setDescription={setDescription}
                descriptionError={false}
                setDescriptionError={function (
                  value: React.SetStateAction<boolean>
                ): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:space-x-4 sm:justify-end">
                <Button
                  className="w-full sm:w-auto mt-4 sm:mt-0 secondary"
                  variant="light"
                  onClick={(e) => handleDescriptionCancel(e)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto primary"
                  onClick={(e) => handleDescriptionSubmit(e)}
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </DialogPanel>
      </Dialog>
      <Toaster />
    </>
  );
}
