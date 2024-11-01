import { Card, Title, Text, Grid, Col, DateRangePicker, Metric, Subtitle, Bold, Italic, Select, SelectItem, TabGroup, TabList, Tab, DateRangePickerItem, DateRangePickerValue } from "@tremor/react";
import { useState, useMemo } from "react";
import { FormDialog } from "./form/Form";
import { MultiSelect, MultiSelectItem } from '@tremor/react';


export default function Fatturato() {

    const today = new Date(Date.now());
    const [groupKey, setGroupKey] = useState("1");
    const [selectedView, setSelectedView] = useState(0);
    const [selectedDocuments, setselectedDocuments] = useState<string[]>(['doc1']);

    return (
        <main>
            <Title>Dashboard</Title>
            <Text>Explore Kiruna</Text>
            <div className="flex items-stretch mt-6">
                <TabGroup className="flex-1" onIndexChange={(index) => { setSelectedView(index) }}>
                    <TabList>
                        <Tab>
                            Map
                        </Tab>
                        <Tab>
                            Insights
                        </Tab>
                        <Tab>
                            Notes
                        </Tab>
                        
                    </TabList>
                </TabGroup>
            </div>
            <Grid numItemsLg={6} className="gap-6 mt-6">
                <Col numColSpanLg={5}>
                    <Card className="h-full">
                        {renderCurrentSelection(selectedView)}
                    </Card>
                </Col>

                <Col numColSpanLg={1}>
                    <div className="space-y-6">
                    <FormDialog />

                        <Card>
                            <Text>Select</Text>
                            <Select
                                className="mt-2" value={groupKey} onValueChange={setGroupKey}
                            >
                                <SelectItem value="1">
                                    1
                                </SelectItem>
                                <SelectItem value="2">
                                    2
                                </SelectItem>
                                <SelectItem value="3">
                                    3
                                </SelectItem>
                                <SelectItem value="4">
                                    4
                                </SelectItem>
                                <SelectItem value="5">
                                    5
                                </SelectItem>
                            </Select>
                        </Card>
                        <Card>
                            <Metric>EUR 1,995</Metric>
                            <Title>Drei Weieren is an oasis of peace in the middle of St.Gallen.</Title>
                            <Subtitle>Drei Weieren is an oasis of peace in the middle of St.Gallen.</Subtitle>
                            <Text>Drei Weieren is an oasis of peace in the middle of St.Gallen.</Text>
                            <Text>Drei Weieren is an <Bold>oasis of peace</Bold> in the middle of <Italic>St.Gallen.</Italic></Text>
                        </Card>
                    </div>
                </Col>

            </Grid>
            <Card className="mt-6">
                <>
                    Bottom diagram
                </>
            </Card>
        </main >
    );
    function renderCurrentSelection(selectedView: number = 0) {
        switch (selectedView) {
            case 0:
                return (
                    <>
                        <Card> Pag 1</Card>
                    </>
                );
            case 1:
                return (
                    <>
                        <Card>Pag 2</Card>
                    </>
                );
            case 2:
                return (
                    <>
                        <Card>Pag 4</Card>
                    </>
                );
        }

    }
}