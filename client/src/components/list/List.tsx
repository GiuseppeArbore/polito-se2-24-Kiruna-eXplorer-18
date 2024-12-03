import "ag-grid-enterprise";
import { AdvancedFilterModel, ColDef, GridOptions, ValueGetterParams } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KxDocument } from "../../model";
import { Badge, Button, Flex, Card, Text } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { RiDeleteBinLine, RiInfoI } from "@remixicon/react";
import { toast } from "../../utils/toaster";
import locales from "../../locales.json";
import API from "../../API";
import DeleteDialog from "./DeleteDialog";
import { Stakeholders } from "../../enum";


interface ListProps {
  documents: KxDocument[];
  updateDocuments: (documents: KxDocument[]) => void;
  updateFilterModel: (filterModel: AdvancedFilterModel | undefined) => void;
  filterModel: AdvancedFilterModel | undefined;
}


function List(props: ListProps) {
  const navigator = useNavigate();

  const gridRef = useRef<AgGridReact<KxDocument>>(null);
  const onFirstDataRendered = useCallback((params: any) => {
    onGridReady(params);
    params.api.sizeColumnsToFit();
  }, []);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const rowNode = useRef<any>();
  const infoButton = (params: any) => {
    return (
      <Flex justifyContent="evenly" className="mt-1">
        <Button
          size="xs"
          icon={RiInfoI}
          onClick={() => navigator("/documents/" + params.value)}
        />
        <Button
          style={{ backgroundColor: "red" }}
          color="red"
          size="xs"
          icon={RiDeleteBinLine}
          onClick={async () => {
            setDeleteConfirm(true);
            rowNode.current = params.data;
          }}
        />
      </Flex>
    );
  };
  const StakeholdersRenderer = (params: any) => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {params.value &&
          params.value.map((stakeholder: Stakeholders, index: number) => {
            return (
              <Badge key={index} className="text-sm">
                <span className="text-sm">{stakeholder}</span>
              </Badge>
            );
          })}
      </div>
    );
  };
  const KxColDefs: ColDef<KxDocument>[] = [
    {
      headerName: "Title",
      field: "title",
      enableRowGroup: false,
      filter: true,
      sortable: true,
    },
    { headerName: "Type", field: "type", enableRowGroup: true, filter: true },
    {
      headerName: "Stakeholders",
      field: "stakeholders",
      enableRowGroup: false,
      filter: true,
      cellRenderer: (params: any) => StakeholdersRenderer(params),
    },
    {
      headerName: "Scale",
      field: "scale",
      enableRowGroup: true,
      filter: true,
      valueFormatter: (params: { value: string | number }) => {
        return params.value !== undefined
          ? "1:" + params.value.toLocaleString()
          : "";
      },
      hide: true,
    },
    {
      headerName: "Issuance Date",
      field: "issuance_date",
      filterValueGetter: (params: ValueGetterParams<KxDocument, any>) => {
        return params.data && new Date(params.data.issuance_date.from).toLocaleDateString() || "";
      },
      valueFormatter: (params: { value: string | number }) => {
        return params.value !== undefined
          ? new Date(params.value).toLocaleDateString()
          : "";
      },
      hide: true,
    },
    {
      headerName: "Area Type",
      field: "doc_coordinates",
      enableRowGroup: true,
      filter: true,
      valueFormatter: (params: any) => {
        if (params.value) {
          if (params.value.type === "EntireMunicipality") {
            return "Entire Municipality";
          } else if (params.value.type === "Polygon") {
            return "Area";
          } else if (params.value.type === "Point") {
            return "Point";
          }
        }
        return "";
      },
    },
    {
      headerName: "Language",
      field: "language",
      enableRowGroup: true,
      filter: true,
      filterValueGetter: (params: ValueGetterParams<KxDocument, any>) => {
        return locales.find((l) => params.data && l.code === params.data.language)?.name;
      },
      valueFormatter: (params: { value: string | number }) => {
        return locales.find((l) => l.code === params.value)?.name || "";
      },
      hide: true,
    },
    {
      headerName: "Pages",
      field: "pages",
      enableRowGroup: false,
      filter: true,
      hide: true,
    },
    {
      headerName: "Controls",
      field: "_id",
      minWidth: 30,
      enableRowGroup: false,
      cellRenderer: (params: any) => infoButton(params),
      filter: false,
    },
  ];

  const autoGroupColumnDef = {
    sortable: false,
    headerName: "Group",
  };
  const gridOptions: GridOptions<KxDocument> = {
    columnDefs: KxColDefs,
    rowGroupPanelShow: "always",
    animateRows: true,
    pagination: false,
    enableAdvancedFilter: true,
    defaultColDef: {
      filter: true,
      flex: 1,
      resizable: true,
      sortable: true,
      enableRowGroup: true,
      filterParams: { newRowsAction: 'keep' }
    },
    statusBar: {
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent' },
        { statusPanel: 'agTotalRowCountComponent' },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' }
      ]
    },
    sideBar: {
      toolPanels: [
        {
          id: "columns",
          labelDefault: "Columns",
          labelKey: "columns",
          iconKey: "columns",
          toolPanel: "agColumnsToolPanel",
        },
        {
          id: "filters",
          labelDefault: "Filters",
          labelKey: "filters",
          iconKey: "filter",
          toolPanel: "agFiltersToolPanel",
        },
      ],
    },
    autoGroupColumnDef: autoGroupColumnDef,
    rowSelection: {
      mode: "multiRow",
    },
  };

  function onGridReady(params: any) {
    const allColumnIds: string[] = [];
    gridRef.current!.api!.getAllGridColumns()!.forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current!.api!.autoSizeColumns(allColumnIds, false);
    params.api.sizeColumnsToFit();
  }

  const rowData = useMemo(() => {
    return props.documents;
  }, [props.documents]);

  function onFilterChanged() {
    let rowData: (KxDocument | undefined)[] = [];
    gridRef.current?.api?.forEachNodeAfterFilter((node) => {
      rowData.push(node.data)
    });
    props.updateDocuments(rowData.filter((doc): doc is KxDocument => doc !== undefined));
    props.updateFilterModel(gridRef.current?.api?.getAdvancedFilterModel() || undefined);
  }

  function addFilterModel() {
    if (props.filterModel) {
      gridRef.current?.api?.setAdvancedFilterModel(props.filterModel);
    } else {
      props.updateFilterModel(undefined);
    }
  }

  function sizeColumnsToFitGridStategy(params: any){
    params.api.sizeColumnsToFit();
  }

  return (
    <>
      <div
        className={"ag-theme-quartz-auto-dark right-0 left-0 ring-0"}
        style={{ width: "100%", height: "100%", minHeight: "70vh", overflow: "auto" }}
      >
        <AgGridReact
          onViewportChanged={addFilterModel}
          onGridColumnsChanged={onGridReady}
          rowData={rowData}
          onFirstDataRendered={onFirstDataRendered}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
          ref={gridRef}
          animateRows={true}
          onFilterChanged={onFilterChanged}
          onGridSizeChanged={sizeColumnsToFitGridStategy}
        />
      </div>

      {DeleteDialog(
        deleteConfirm,
        setDeleteConfirm,
        async () => {
          try {
            await API.deleteKxDocument(rowNode.current._id);
            gridRef.current?.api?.applyTransaction({
              remove: [rowNode.current],
            });
            toast({
              title: "Success",
              description: "The document has been deleted successfully",
              variant: "success",
              duration: 3000,
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to delete documents",
              variant: "error",
              duration: 3000,
            });
          }
        },
        rowNode.current?.title
      )}
    </>
  );
}

export default List;
