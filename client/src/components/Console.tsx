import {
    Card,
    Title,
    Text,
    Grid,
    Col,
    Metric,
    TabGroup,
    TabList,
    Tab,
    TextInput,
} from "@tremor/react";
import "../css/dashboard.css"
import API from "../API";
import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "./form/Form";
import { DashboardMap } from "./map/Map";
import { Area, KxDocument, Point } from "../model";
import List from "./list/List";
import { Toaster } from "./toast/Toaster";
import { toast } from "../utils/toaster";
import { FeatureCollection } from "geojson";
import { Link } from "react-router-dom";
import { RiHome2Fill, RiArrowRightSLine, RiArrowLeftSLine, RiSearchLine } from "@remixicon/react";
import { AdvancedFilterModel } from "ag-grid-enterprise";
import { Stakeholders } from "../enum";

interface ConsoleProps {
    user: { email: string; role: Stakeholders } | null;
}

const Console: React.FC<ConsoleProps> = ({ user }) => {
    const [quickFilterText, setQuickFilterText] = useState('');
    const [documents, setDocuments] = useState<KxDocument[]>([]);
    const [tmpDocuments, setTmpDocuments] = useState<KxDocument[]>([]);
    const [selectedView, setSelectedView] = useState(0);
    const [refreshNeeded, setRefreshNeeded] = useState(true);
    const [filterModel, setFilterModel] = useState<AdvancedFilterModel | undefined>(undefined);
    const [entireMunicipalityDocuments, setEntireMunicipalityDocuments] =
        useState<KxDocument[]>([]);
    const [pointOrAreaDocuments, setPointOrAreaDocuments] = useState<
        KxDocument[]
    >([]);
    function getIconForType(type: string): string {
        switch (type) {
            case 'Informative Document':
                return 'icon-InformativeDocument';
            case 'Prescriptive Document':
                return 'icon-PrescriptiveDocument';
            case 'Design Document':
                return 'icon-DesignDocument';
            case 'Technical Document':
                return 'icon-TechnicalDocument';
            case 'Strategy':
                return 'icon-Strategy';
            case 'Agreement':
                return 'icon-Agreement';
            case 'Conflict Resolution':
                return 'icon-ConflictResolution';
            case 'Consultation':
                return 'icon-Consultation';
            default:
                return 'default-icon';
        }
    }
    const drawing: FeatureCollection = {
        type: "FeatureCollection",
        features: pointOrAreaDocuments.map((doc) => ({
            type: "Feature",
            geometry: doc.doc_coordinates as Area | Point,
            properties: {
                title: doc.title,
                description: doc.description,
                id: doc._id,
                type: doc.type,
                icon: getIconForType(doc.type)
            },
        })),
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const docs = await API.getAllKxDocuments();
                setDocuments(docs);
                setTmpDocuments(docs);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to retrieve documents",
                    variant: "error",
                    duration: 3000,
                });
            }
        };
        if (refreshNeeded) {
            fetchDocuments();
            setRefreshNeeded(false);
        }
    }, [refreshNeeded]);


    useMemo(() => {
        const entireMunicipalityDocs = tmpDocuments.filter(
            (doc) => doc.doc_coordinates?.type === "EntireMunicipality"
        );
        const otherDocs = tmpDocuments.filter(
            (doc) => doc.doc_coordinates?.type !== "EntireMunicipality"
        );
        setEntireMunicipalityDocuments(entireMunicipalityDocs);
        setPointOrAreaDocuments(otherDocs);

    }, [tmpDocuments]);




    const [showSideBar, setShowSideBar] = useState(true);

    useEffect(() => {
        if (selectedView === 0) {
            setShowSideBar(true);
        } else {
            setShowSideBar(false);
        }
    }, [selectedView]);


    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    return (
        <main>
            <div className='flex flex-row mb-0' style={{ marginTop: '-2rem', marginBottom: '2.3rem' }}>
                <h1 className="text-2xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Dashboard</h1>
            </div>
            <div className="flex items-stretch mt-7">
                <TabGroup
                    className="flex-1"
                    onIndexChange={(index) => {
                        setSelectedView(index);
                    }}
                >

                    <div style={{ position: 'relative' }}>
                        <div style={{ gridColumn: '11 / span 2', position: 'absolute', right: '0', marginTop: '-2.5rem' }}>
                            <FormDialog
                                documents={documents}
                                refresh={() => setRefreshNeeded(true)}
                                user={user}
                            />
                        </div>
                    </div>

                    <TabList style={{ marginTop: '-2rem' }}>
                        <Tab>Map</Tab>
                        <Tab>List</Tab>
                        <Tab>Timeline</Tab>
                    </TabList>
                </TabGroup>
            </div>

            <Grid numItemsLg={12} className="gap-6 mt-6">
                <Col numColSpanLg={12}>
                    <div className="h-full w-full" style={{ display: 'flex', flexDirection: 'row' }}>
                        <Card
                            className="p-0 m-0"
                            style={{
                                marginTop: '-1rem',
                                padding: 0,
                                minHeight: "300px",
                                width: "100%",
                                height: "70vh",
                            }}
                        >
                            {renderCurrentSelection( setQuickFilterText, selectedView)}
                        </Card>
                    </div>
                </Col>
            </Grid>
            <Card className="mt-6">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <div>Diagram Coming soon...</div>
                </div>
            </Card>
            <Toaster />
        </main>
    );
    function renderCurrentSelection(setQuickFilterText: (_: string) => void, selectedView: number = 0) {
        return (
            <>
                <DashboardMap
                    style={{
                        margin: 0,
                        minHeight: "300px",
                        width: "100%",
                        height: "70vh",
                        borderRadius: 4,
                        display: selectedView === 0 ? 'block' : 'none',
                    }}
                    user={user}
                    drawing={drawing}
                    entireMunicipalityDocuments={entireMunicipalityDocuments}
                    isVisible={selectedView === 0 ? true : false}
                    setQuickFilterText={setQuickFilterText}
                />
                <div
                    className="ring-0 shadow-none"
                    style={{
                        display: selectedView === 1 ? 'flex' : 'none',
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <List user={user} documents={documents} updateDocuments={setTmpDocuments} updateFilterModel={setFilterModel} filterModel={filterModel} quickFilter={quickFilterText} />
                </div>
                <div
                    style={{
                        display: selectedView === 2 ? 'flex' : 'none',
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <div>Coming soon...</div>
                </div>
            </>
        );
    }
}

export default Console;
