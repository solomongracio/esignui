import React, { useEffect, useState } from 'react';
import axios from "axios";
import Head from 'next/head';
import { PDFDocument } from 'pdf-lib'
import {
    PdfViewerComponent, Navigation, LinkAnnotation, BookmarkView, Magnification,
    ThumbnailView, Print, TextSelection, Annotation, TextSearch, FormFields, FormDesigner, Inject
} from '@syncfusion/ej2-react-pdfviewer';
import { registerLicense } from '@syncfusion/ej2-base';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import { base64ToBytes, blobToBase64, bytesToBase64 } from '../../utils/fileConversion';
import { useRouter } from 'next/router';
import ReactModal from "react-modal";
import "../../styles/globals.css"

registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCdkx3Qnxbf1x0ZFRHal5RTnJYUiweQnxTdEFjXn5WcXVXRmRUUEB/WQ==');


ReactModal.setAppElement("#get-started-modal");

const customStyle = {
    overlay: {
        zIndex: 51,
        background: 'rgba(0,0,0,0.65)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        borderRadius: '15px'
    },
};

const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    parts: [
        { type: 'year' },
        { type: 'literal', value: ' at ' },
        { type: 'month' },
        { type: 'literal', value: ' ' },
        { type: 'day' },
        { type: 'literal', value: ', ' },
        { type: 'hour12' },
        { type: 'literal', value: ':' },
        { type: 'minute', pad: '0' },
        { type: 'literal', value: ' ' }, // Add space before time zone
        { type: 'timeZoneName', style: 'short' }, // Time zone name (e.g., PST)
    ]
});

const ESign = ({ data }) => {
    const [pdfURL, setPdfUrl] = useState();
    const [loading, setLoading] = useState(false);
    const [agreement, setAgreement] = useState({});
    const [pdfFields, setPdfFields] = useState([]);
    const [formFields, setFormFields] = useState([]);
    const [started, setStarted] = useState(false);
    const [formInd, setFormInd] = useState(-1);
    const [uploading, setUploading] = useState(false);
    const [showThankyou, setShowThankyou] = useState(false);
    const [error, setError] = useState("");
    const [docViewer, setDocViewer] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [loadingError, setLoadingError] = useState(false);

    const router = useRouter();
    const { slug } = router.query;

    useEffect(() => {
        if (!loading && slug) {
            getData();
        }
    }, [slug]);

    useEffect(() => {
        if (formFields[formInd] && docViewer) {
            docViewer.focusFormField(formFields[formInd]);
        }
    }, [formInd]);


    const onClose = () => {
        setShowSubmitModal(false);
    }

    const closeModal = () => {
        setShowSubmitModal(false);
    }


    const getData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://9mvqavbmqm.ap-southeast-2.awsapprunner.com/sfAPI/loadPDF/" + slug);

            // const response = await axios.get("http://localhost:9000/sfAPI/loadPDF/" + slug);
            setLoading(false);
            if (response.data && response.data.agreement) {
                setAgreement(response.data.agreement);
                setPdfFields(response.data.formFieldMetadata);
                const pdf = response.data.agreement.TemplateURL__c;
                let [, url] = pdf.split(".com/");
                // converting to s3pdf url to overcome cors issue. Rewrite rule specified next.config.js
                setPdfUrl(location.origin + '/s3pdf/' + url);
            } else {
                setLoadingError(true)
            }
        } catch {
            setLoading(false);
            setLoadingError(true)
        }
    }

    const getTodayDate = () => {
        const now = new Date();

        const day = ("0" + now.getDate()).slice(-2);
        const month = ("0" + (now.getMonth() + 1)).slice(-2);

        const today = now.getFullYear() + "-" + (month) + "-" + (day);
        return today;
    }

    const set_Order_Date_Fields = (fields) => {
        const fieldMap = {};
        pdfFields.forEach(f => {
            fieldMap[f.FormFieldName__c] = f;
        });
        fields = fields.map((field, ind) => {
            const apiField = fieldMap[field.name];
            const inputEl = document.getElementById(field.id);
            field.fontSize = 12;
            let value = "";
            if (apiField.Prefill__c) {
                if (apiField.salesforceValue) value = apiField.salesforceValue;
                if (apiField.DisplayName__c && apiField.DisplayName__c.toLowerCase().indexOf("today") > -1) value = getTodayDate();
                docViewer.formDesignerModule.updateFormField(field, { fontSize: 12, value });
            }


            if (inputEl) {
                inputEl.disabled = true;
                if (apiField.Type__c === "Date") {
                    inputEl.type = "date";
                }
            }
            field.order = apiField.Order__c;
            field.DisplayName__c = apiField.DisplayName__c;
            field.ReadOnly__c = apiField.ReadOnly__c;
            field.ind = ind;
            return field;
        });

        fields.sort((a, b) => a.order - b.order);
        fields = fields.filter(field => !field.ReadOnly__c);
        fields = fields.map((field, ind) => ({ ...field, ind }));
        setFormFields(fields);

    }

    const documentLoaded = () => {
        if (docViewer) {
            const fields = docViewer.retrieveFormFields();
            set_Order_Date_Fields(fields);
        }
    }

    const start = () => {

        if (formFields) {
            formFields.forEach(field => {
                document.getElementById(field.id).disabled = false;
            })
        }
        if (docViewer) {
            setStarted(true);
            setFormInd(0);
        }
    }

    const goPrev = () => {
        if (formInd > 0) {
            setFormInd(formInd - 1);
        }
    }

    const goNext = () => {
        if (formFields[formInd + 1]) {
            setFormInd(formInd + 1);
            setError("");
        }
    }

    const isValid = () => {
        const fields = docViewer.formFields;
        if (!fields) return false;
        let valid = true;
        for (let i = 0; i < fields.length; i++) {
            const property = fields[i].properties;
            if (!property.value || (property.value && property.value.trim() === "")) {
                valid = false;
                const apiField = formFields.find(field => field.name === property.name)
                setFormInd(apiField.ind);
                setError("Validation Failed. Please fill " + apiField.DisplayName__c);
                break;
            }
        }
        return valid;
    }

    const adjustDynamicFontSize = () => {
        const formFields = docViewer.retrieveFormFields();
        formFields.forEach(formField => {
            const { value, bounds, type } = formField;
            if (type === "Textbox") {
                let width = bounds.Width || bounds.width;
                const len = value.length;
                const widthPerLetter = 5.7;
                const requiredWidth = len * widthPerLetter;
                if (requiredWidth > width) {
                    let fontSize = 6;
                    const diff = requiredWidth - width;
                    if (diff < 50) fontSize = 11;
                    else if (diff < 70) fontSize = 9;
                    else if (diff < 145) fontSize = 8;
                    docViewer.formDesignerModule.updateFormField(formField, { fontSize });
                }
            }
        });
    }

    const handleSubmit = () => {
        if (!isValid()) {
            return;
        }
        setShowSubmitModal(true);
    }

    const submitPDF = async () => {

        adjustDynamicFontSize()

        const blob = await docViewer.saveAsBlob();
        const base64Data = await blobToBase64(blob);
        const pdfData = await base64ToBytes(base64Data);

        const pdfUrl1 = URL.createObjectURL(blob);
        const link1 = document.createElement('a'); // Create a download link
        link1.href = pdfUrl1;
        link1.download = 'USNDA.pdf'; // Set the download filename
        //link1.click(); // Simulate a click event to trigger download

        URL.revokeObjectURL(link1);
        const signerTemplateData = await fetch("/SignerTemplate.pdf").then(res => res.arrayBuffer())


        const pdfDoc = await PDFDocument.load(pdfData);
        const form = pdfDoc.getForm();
        if (form) form.flatten();


        const signerTemplateDoc = await PDFDocument.load(signerTemplateData);


        const signerPages = signerTemplateDoc.getPages();
        const signerPage = signerPages[0];

        // Title
        signerPage.drawText('Master Services Agreement (Revature India and Revature)', {
            x: 45,
            y: 535,
            size: 9
        });

        // ID
        signerPage.drawText(agreement.Id, {
            x: 360,
            y: 535,
            size: 9
        });

        // Name
        signerPage.drawText(agreement.DisplayName__c, {
            x: 55,
            y: 440,
            size: 12
        });

        let signerData;

        if (agreement && agreement.Signers__r && agreement.Signers__r.records && agreement.Signers__r.records[0]) {
            signerData = agreement.Signers__r.records[0];
            // Signer ID
            signerPage.drawText(signerData.Id, {
                x: 350,
                y: 446,
                size: 8
            });

            // Email
            signerPage.drawText(signerData.Email__c, {
                x: 350,
                y: 432,
                size: 8
            });
        }

        const date = formatter.format(new Date());
        const ip = agreement.ipAddress;
        const userAgent = data.userAgent;

        signerPage.drawText(date, {
            x: 100,
            y: 394,
            size: 7
        });

        if (ip) {
            signerPage.drawText(ip, {
                x: 100,
                y: 379,
                size: 7
            });
        }
    

        signerPage.drawText(userAgent, {
            x: 100,
            y: 364,
            size: 7
        });

        // await pdfDoc.save();
        const mergedPdf = await PDFDocument.create();
        const agreementPdf = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        agreementPdf.forEach((page) => mergedPdf.addPage(page));

        const signerTemplatePdf = await mergedPdf.copyPages(signerTemplateDoc, signerTemplateDoc.getPageIndices());
        signerTemplatePdf.forEach((page) => mergedPdf.addPage(page));

        const pdfBytes = await mergedPdf.save();

        const blob1 = new Blob([pdfBytes], { type: 'application/pdf' }); // Create a Blob
        const pdfUrl = URL.createObjectURL(blob1); // Generate a temporary URL

        const link = document.createElement('a'); // Create a download link
        link.href = pdfUrl;
        link.download = 'USNDA.pdf'; // Set the download filename
        // link.click(); // Simulate a click event to trigger download

        URL.revokeObjectURL(pdfUrl); // Revoke the temporary URL after 
        const finalpdfbase64 = bytesToBase64(pdfBytes);

        const url = "https://apim.workato.com/revaturea/s3-v1/upload-signed-document";
        const body = {
            filename: `${agreement.Id}.pdf`,
            email: signerData ? signerData.Email__c : '',
            data: finalpdfbase64,
            agreementId: agreement.Id,
            status: "Accepted",
            ipAddress: agreement.ipAddress,
            userAgent: data.userAgent,
            signerName: signerData ? signerData.Name : '',
            // documentName: 
        }
        const jsonData = JSON.stringify(body);
        const options = {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'API-TOKEN': 'b4f5c794fa5c4e1262797f26119283eb59267d6202e9f0bbcfb787eb97c850ba'
            },
            body: jsonData
        }

        try {
            setUploading(true);
            const response = await fetch(url, options);
            if (response.ok) {
                console.log("success");
                console.log(response);
                setShowThankyou(true);
            } else {
                console.log("some went wrong");
                alert("Something went wrong");
            }
            setUploading(false);
        } catch (err) {
            setUploading(false);
            console.log("some went wrong");
            console.log(err);
            alert("Something went wrong");
        }
        setShowSubmitModal(false);
    }


    return (
        <>
            <Head>
                <title>Revature Agreement</title>
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {showThankyou ?
                <div className='text-center pt-16'>
                    <div className='text-2xl'>You’re all set!</div>
                    <div className='text-2xl pt-5'>You’ve signed . We will email you a copy of the contract for your records.</div>
                </div> :
                <div className='control-section'>
                    {loading && <div className="text-center mt-10"><Loader className="!w-10 !h-10" /></div>}
                    {
                        ((agreement && agreement.Status__c && agreement.Status__c !== "Sent") || loadingError) && !loading ?
                            <div className="text-center mt-28 md:px-16">
                                <h1 className="f-h6">
                                    The document has failed to load or has already been signed.
                                </h1>
                                <h1 className="f-h6">
                                    Please reach out to your recruiter for more information.
                                </h1>
                            </div> : null
                    }

                    {agreement && agreement.Status__c === "Sent" && !loadingError && pdfURL &&
                        <div className="pt-24">
                            <div className="fixed top-0 z-10 w-full bg-white border-b">
                                <div className='text-center py-1 border-b'>
                                    <div className='font-semibold text-xl '>Revature Agreement</div>
                                </div>
                                <div>
                                    <div className="flex justify-center pt-3 ">
                                        <div className="text-sm">By proceeding, you agree that this agreement may be signed using electronic signatures.</div>
                                    </div>

                                    <div className="flex justify-center py-3 ">
                                        {!started && <Button size="small" onClick={start} hoverColor="none">Start</Button>}
                                        {started &&
                                            <div className="flex gap-7 w-[370px] items-center relative">
                                                <Button size="small" hoverColor="none" onClick={goPrev} disabled={formInd === 0}>Prev</Button>
                                                <div className="text-gray-600 min-w-[120px] text-center text-sm">Enter {formFields[formInd]?.DisplayName__c}</div>
                                                {formFields.length - 1 > formInd && <Button size="small" hoverColor="none" onClick={goNext} disabled={formFields.length - 1 === formInd}>Next</Button>}
                                                {formFields.length - 1 === formInd && <Button size="small" hoverColor="none" color="darkNavy" onClick={handleSubmit} disabled={uploading}> <div className='flex items-center'> Submit</div></Button>}
                                                {error && <div className="text-red-600 absolute -right-[260px] text-sm">{error}</div>}
                                            </div>
                                        }

                                    </div>

                                </div>
                            </div>

                            <PdfViewerComponent
                                ref={(scope) => { setDocViewer(scope) }}
                                id="container"
                                enableHandwrittenSignature={false}
                                signatureFieldSettings={{
                                    signatureDialogSettings: {
                                        // hideSaveSignature: false,
                                        displayMode: 2
                                    }
                                }}
                                // handWrittenSignatureSettings={{
                                //     typeSignatureFonts: ["cursive", "fantasy", "monospace", "Roboto"]
                                // }}
                                documentPath={pdfURL}
                                initialRenderPages={5}
                                resourceUrl="https://cdn.syncfusion.com/ej2/23.1.40/dist/ej2-pdfviewer-lib"
                                style={{ 'height': 'calc(100vh - 90px)' }}
                                documentLoad={() => documentLoaded()}
                            >
                                <Inject services={[
                                    Annotation,
                                    Navigation,
                                    Magnification,
                                    LinkAnnotation,
                                    BookmarkView,
                                    ThumbnailView,
                                    Print,
                                    TextSelection,
                                    TextSearch,
                                    FormFields,
                                    FormDesigner
                                ]} />

                            </PdfViewerComponent>
                        </div>
                    }
                </div>
            }

            <ReactModal isOpen={showSubmitModal} onRequestClose={onClose} style={customStyle} shouldCloseOnOverlayClick={false}>
                <div className="flex justify-between">
                    <div className="text-3xl font-semibold md:max-w-[400px]">
                        Sign Contract
                    </div>
                    <button onClick={closeModal} disabled={uploading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18 18L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <p className="font-semi-bold text-[14px] lg
                :text-[17px] my-7 text-center">
                    By Selecting &quot;Finish Signing&quot; you intend to sign and consent to
                    signing this contract electronically
                </p>
                <div>
                    <div className="flex gap-5 py-3 justify-center ">
                        <Button onClick={() => submitPDF(true)} disabled={uploading} color="darkNavy">
                            <div className='flex'>
                                {uploading && <Loader />}<div className='flex items-center'> Finish Signing</div>
                            </div>
                        </Button>
                    </div>
                </div>
            </ReactModal>

            <div id="get-started-modal"></div>
        </>
    )
}


export default ESign

export async function getServerSideProps({ req }) {
    const userAgent = req.headers["user-agent"];
    return {
        props: {
            data: {
                userAgent
            }
        }, 
    };
}