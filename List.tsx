import useModel from "../hooks/useModel";
import { useMutation, useQuery } from "react-query";
import { Fragment, ReactNode, useEffect, useState } from "react";
import LoadingOverlay from "@/components/custom-ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  FileEdit,
  Trash,
  View,
} from "lucide-react";
import Tooltip from "@/components/custom-ui/Tooltip";
import Confirm from "@/components/custom-ui/Confirm";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Form from "./Form";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  getExpandedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

const List = (props: {
  create?: boolean;
  suffix?: ReactNode;
  onError: any;
  onSuccess: any;
  collectioName?: string;
}) => {
  const { toast } = useToast();

  const {
    fields,
    api,
    name,
    crud,
    isRaw,
    setIsRaw,
    filters = {},
    collectionName,
    ...model
  } = useModel();
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const dataQuery = useQuery([name, pageIndex, pageSize, filters], () =>
    api.find({
      pagesize: pageSize,
      pagenumber: pageIndex + 1,
      ...filters,
    })
  );

  const mutationDelete = useMutation(
    (id: any) => {
      return api.delete(id);
    },
    {
      onSuccess: () => {
        dataQuery.refetch();
        setCurrent(undefined);
        toast({
          title: "Амжилттай устгагдлаа.",
        });
      },
      onError: (e: Error) => {
        toast({
          variant: "destructive",
          title: "Алдаа гарлаа",
          description: e?.message,
          action: <ToastAction altText="Try again">Хаах</ToastAction>,
        });
      },
    }
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<any>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrent(null);
    }
  }, [open]);

  const listFields = fields?.filter((field) => {
    return !field.hideIn || !field.hideIn?.list;
  });
  console.log("gggmodel", model);
  const columns = React.useMemo<ColumnDef<any>[]>(
    () =>
      model.renderExpand
        ? [
            {
              id: "expander",
              header: () => null,
              cell: ({ row }) => {
                return row.getCanExpand() ? (
                  <Button
                    {...{
                      onClick: row.getToggleExpandedHandler(),
                      style: { cursor: "pointer" },
                    }}
                    variant="outline"
                    size={"sm"}
                  >
                    {row.getIsExpanded() ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </Button>
                ) : (
                  "🔵"
                );
              },
            },
            {
              id: "id-index",
              header: () => "№",
              cell: ({ row }) => {
                return (
                  <>
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      row.index +
                      1}
                  </>
                );
              },
            },
            // {
            //   id: "original-id",
            //   header: () => "#",
            //   cell: ({ row }) => {
            //     return row?.original?.id;
            //   },
            // },
            ...((listFields || [])?.map((f, i) => ({
              header: f.label,
              accessorKey: f.name,
              cell: (info) =>
                f.render
                  ? f.render(
                      info.getValue(),
                      info.row.original,
                      i,
                      handleRequest
                    )
                  : info.getValue(),
              // footer: (info) => info.column.id,
            })) || []),
            // {
            //   id: "id-action",
            //   header: () => "Үйлдэл",
            //   cell: ({ row }) => {
            //     return <>Үйлдэл</>;
            //   },
            // },
          ]
        : [
            {
              id: "id-index",
              header: () => "№",
              cell: ({ row }) => {
                return (
                  <>
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      row.index +
                      1}
                  </>
                );
              },
            },
            // {
            //   id: "original-id",
            //   header: () => "#",
            //   cell: ({ row }) => {
            //     return row.original?.id;
            //   },
            // },
            ...((listFields || [])?.map((f, i) => ({
              header: f.label,
              accessorKey: f.name,
              cell: (info) =>
                f.render
                  ? f.render(
                      info.getValue(),
                      info.row.original,
                      i,
                      handleRequest
                    )
                  : info.getValue(),
              // footer: (info) => info.column.id,
            })) || []),
            // {
            //   id: "id-action",
            //   header: () => "Үйлдэл",
            //   cell: ({ row }) => {
            //     return <>Үйлдэл</>;
            //   },
            // },
          ],
    []
  );
  const defaultData = React.useMemo(() => [], []);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const total = Math.ceil(dataQuery?.data?.RowCount / pagination.pageSize);

  const table: any = useReactTable({
    data: dataQuery?.data?.Data ?? defaultData,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    pageCount: total,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    manualPagination: true,
    getRowCanExpand: () => !!model.renderExpand,
    getExpandedRowModel: getExpandedRowModel(),
  });

  useEffect(() => {
    if (filters) {
      setPagination({ pageSize, pageIndex: 0 });
    }
  }, [filters]);

  const [loading, setLoading] = useState(false);

  const handleRequest = async (promise: () => Promise<any>) => {
    setLoading(true);
    await promise();
    dataQuery.refetch();
    setLoading(false);
  };

  const [max, setMax] = useState(false);
  return (
    <>
      {props.create && !props?.suffix ? (
        <div className="flex justify-between items-center py-4">
          {model?.raw ? (
            <Tabs
              value={isRaw ? "raw" : "general"}
              onValueChange={(e) => {
                setIsRaw(e === "raw");
              }}
            >
              <TabsList className="mb-2">
                <TabsTrigger value="general">Энгийн</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <div></div>
          )}

          <Button
            onClick={() => {
              setCurrent(null);
              setOpen(true);
            }}
          >
            Нэмэх
          </Button>
        </div>
      ) : (
        <div className="pt-4 pb-6">
          {/* <div className="flex justify-between items-center py-4 space-x-4"> */}
          <div className="flex justify-end pb-4">
            {props.create && (
              <Button
                onClick={() => {
                  setCurrent(null);
                  setOpen(true);
                }}
              >
                Нэмэх
              </Button>
            )}
          </div>
          {model?.raw ? (
            <Tabs
              value={isRaw ? "raw" : "general"}
              onValueChange={(e) => {
                setIsRaw(e === "raw");
              }}
            >
              <TabsList className="mb-2">
                <TabsTrigger value="general">Энгийн</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : props?.suffix ? (
            <></>
          ) : (
            <div></div>
          )}
          {props.suffix}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={
            max
              ? `max-h-screen h-screen w-screen overflow-y-auto max-w-screen`
              : `max-h-[80vh] overflow-y-auto max-w-2xl`
          }
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              <span>{current ? "Засах" : "Нэмэх"}</span>
            </DialogTitle>
            <div
              onClick={() => {
                setMax(!max);
              }}
              className="absolute cursor-pointer top-[10px] right-12 w-4 h-4 flex items-center justify-center"
            >
              {max ? <IconMinimize size={14} /> : <IconMaximize size={14} />}
            </div>
          </DialogHeader>
          <div>
            <Form
              key={`${current ? "edit-form" : "new-form"}`}
              data={current}
              onSuccess={() => {
                setOpen(false);
                setCurrent(null);
                props?.onSuccess();
              }}
              onError={props?.onError}
            />
          </div>
        </DialogContent>
        <Toaster />
      </Dialog>

      <div className="rounded-md border relative">
        {(crud?.delete ?? !crud?.delete) && (
          <Confirm
            open={deleteOpen}
            setOpen={setDeleteOpen}
            onOk={async () => {
              if (current) {
                setDeleteOpen(false);
                try {
                  await mutationDelete.mutateAsync(current);
                } catch (error) {
                  console.log("error", error);
                }
              }
            }}
          />
        )}
        <LoadingOverlay
          visible={dataQuery.isLoading || mutationDelete.isLoading || loading}
        />

        <div className="p-2 block max-w-full bg-white overflow-x-scroll rounded overflow-y-hidden border-gray-800">
          <div className="h-2" />
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <>
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={`${
                            header.id === "expander"
                              ? "w-[10px] whitespace-nowrap"
                              : " whitespace-nowrap"
                          }`}
                        >
                          {header.isPlaceholder ? null : (
                            <div>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </TableHead>
                      </>
                    );
                  })}
                  <TableHead>Үйлдэл</TableHead>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {/* {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    
                    const matchingField = (listFields || []).find(
                      (f) => f.name === header.column.id
                    );
                      console.log('hehe')
                    return (
                      <TableCell key={header.id} width={100}>
                        {matchingField ? matchingField.renderControl?.() : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))} */}
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const matchingField = (listFields || []).find(
                      (f) => f.name === header.column.id
                    );
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {/* <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div> */}
                        {matchingField?.renderControl?.()}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}

              {/* {<TableRow>
                <TableCell></TableCell>
                <TableCell width={100}>
                  {(listFields || []).map((f, i) => {
                    return f?.renderControl && f.renderControl();
                  })}
                </TableCell>
              </TableRow>} */}

              {table.getRowModel().rows?.length > 0 ? (
                table.getRowModel().rows?.map((row) => {
                  return (
                    <Fragment key={row.original?.id}>
                      <TableRow>
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {model?.renderActions?.(
                              row?.original,
                              handleRequest
                            )}
                            {(crud?.read ?? !crud?.read) && (
                              <Tooltip label="Дэлгэрэнгүй">
                                <Link to={`/${name}/${row?.original?.id}`}>
                                  <Button variant="outline" size="icon">
                                    <View className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </Tooltip>
                            )}
                            {(crud?.update ?? !crud?.update) && (
                              <Tooltip label="Засах">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setCurrent(row.original);
                                    setOpen(true);
                                  }}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            )}
                            {(crud?.delete ?? !crud?.delete) && (
                              <Tooltip label="Устгах">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setCurrent(row.original);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {row.getIsExpanded() && (
                        <TableRow>
                          <TableCell
                            className="p-0"
                            colSpan={row.getVisibleCells().length + 2}
                          >
                            {model.renderExpand &&
                              model.renderExpand(row.original)}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns?.length + 2}>
                    <div className="text-center text-gray-400 p-2 uppercase flex items-center space-x-2 justify-center">
                      <Database /> <span>Дата байхгүй байна!</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-2 pt-4 border-t flex justify-end">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="py-0 px-2"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft size={18} />
              </Button>
              <Button
                size="sm"
                className="py-0 px-2"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                size="sm"
                className="py-0 px-2"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={18} />
              </Button>
              <Button
                size="sm"
                className="py-0 px-2"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight size={18} />
              </Button>
              <span className="flex items-center gap-1">
                <div>Хуудас</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1}
                  {total ? " / " + total : ""}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                | Шууд шилжих:
                <input
                  type="number"
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    table.setPageIndex(page);
                  }}
                  className="border p-1 rounded w-16"
                />
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
              >
                {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default List;
