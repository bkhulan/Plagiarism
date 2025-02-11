1. renderControl: function TempComponent(f) {
        const { value, onChange } = f;
        return (
          <div className="min-w-[210px] w-[300px]">
            <Input
              placeholder="Хайх..."
              // value={value}
              value={value}
              onChange={(e) => {
                // onChange(e.target.value);
                onChange?.(e.target.value);
              }}
            />
          </div>
        );
      },
2. renderControl: function TempComponent(f) {
        const [value, onChange] = useState("");
        return (
          <div className="min-w-[210px] w-[300px]">
            <Input
              placeholder="Хайх..."
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                f?.setQueryFile?.(e.target.value);
              }}
            />
          </div>
------------------------------------------------------------------------------------------------------------------
fields: ModelFiles.fields.map((f: any) => ({
            ...f,
            renderControl: () =>
              f.renderControl &&
              f.renderControl(
                f.name === "fileName"
                  ? {
                      value: queryFile,
                      onChange: setQueryFile,
                    }
                  : {
                      queryOrg,
                      setQueryOrg,
                      queryEmail,
                      setQueryEmail,
                      createdAt,
                      setCreatedAt,
                    }
              ),
          })),
--------------------------------------------------------------------------------
                //   <Popover.Root open={open} onOpenChange={setOpen}>
        //   <Popover.Trigger asChild>
        //     <Button className="bg-gray-200 p-2 rounded-lg flex items-center justify-center">
        //       <Search size={18} className="text-gray-600" />
        //     </Button>
        //   </Popover.Trigger>
    
        //   <Popover.Portal>
        //     <Popover.Content
        //       className="w-[300px] bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50"
        //       side="bottom"
        //       align="start"
        //       sideOffset={5}
        //       // onInteractOutside={(e) => e.preventDefault()}
        //     >
        //       <Input
        //         placeholder="Хайх..."
        //         value={f.queryFile}
        //         onChange={(e) => f.setQueryFile(e.target.value)}
        //       />
        //       <div className="flex items-center gap-2">
        //         <Button className="bg-blue-500 text-white flex items-center gap-1">
        //           <Search size={16} /> Search
        //         </Button>
        //         <Button className="border">Reset</Button>
        //         <Button className="text-blue-500">Filter</Button>
        //         <Button className="text-blue-500" onClick={() => setOpen(false)}>
        //           Close
        //         </Button>
        //       </div>
        //     </Popover.Content>
        //   </Popover.Portal>
        // </Popover.Root>
                    {/* <Button className="bg-gray-200 p-2 rounded-lg flex items-center justify-center">
              <Search size={18} className="text-gray-600" />
            </Button> */}
----------------------------------------------------------------------------- Files.tsx
        import Crud from "@/packages/crud";
import ModelFiles from "@/models/Files";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useDebounce } from "@uidotdev/usehooks";
import * as React from "react";
import CustomDatePicker from "@/components/DatePicker";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface IProps {}

interface FilterState {
  queryFile: string;
  setQueryFile: (value: string) => void;
  queryOrg: string;
  setQueryOrg: (value: string) => void;
  queryEmail: string;
  setQueryEmail: (value: string) => void;
  createdAt: Date | string | null;
  setCreatedAt: (value: Date | string | null) => void;
}

interface IContext {
  queryFile: string;
  setQueryFile: (value: string) => void;
  tmpQueryFile: string;
}

const ContextFilters = React.createContext({} as IContext);

const ProviderFilters = (props: any) => {
  const [queryFile, setQueryFile] = React.useState("");
  const tmpQueryFile = useDebounce(queryFile, 300);
  return (
    <ContextFilters.Provider
      value={{
        queryFile,
        tmpQueryFile,
        setQueryFile,
      }}
    >
      {props?.children}
    </ContextFilters.Provider>
  );
};

const FilesPage = (props: IProps) => {
  const initialFilters = {
    queryFile: "",
    queryOrg: "",
    queryEmail: "",
    createdAt: { from: undefined, to: undefined },
  };

  const [queryFile, setQueryFile] = React.useState(initialFilters.queryFile);
  const [queryOrg, setQueryOrg] = React.useState(initialFilters.queryOrg);
  const [queryEmail, setQueryEmail] = React.useState(initialFilters.queryEmail);
  const [createdAt, setCreatedAt] = React.useState<any>(
    initialFilters.createdAt
  );

  const filename = useDebounce(queryFile, 300);

  const orgname = useDebounce(queryOrg, 300);
  const email = useDebounce(queryEmail, 300);

  const createdatstart = createdAt.from
    ? format(new Date(createdAt.from), "yyyy-MM-dd")
    : undefined;
  const createdatend = createdAt.to
    ? format(new Date(createdAt.to), "yyyy-MM-dd")
    : undefined;

  //   const filterState: FilterState = React.useMemo(() => ({
  //     queryFile,
  //     setQueryFile,
  //     queryOrg,
  //     setQueryOrg,
  //     queryEmail,
  //     setQueryEmail,
  //     createdAt,
  //     setCreatedAt,
  // }), [queryFile, queryOrg, queryEmail, createdAt]);

  const filters = {
    filename,
    orgname,
    email,
    createdatstart,
    createdatend,
  };

  return (
    <>
      <Crud
        model={{
          ...ModelFiles,
          filters,
          api: {
            ...ModelFiles.api,
            insert(data) {
              return Promise.resolve(data);
            },
          },
          fields: ModelFiles.fields.map((f: any) => ({
            ...f,
            renderControl: () =>
              f.renderControl &&
              f.renderControl(
                f.name === "fileName"
                  ? {
                      value: queryFile,
                      onChange: setQueryFile,
                    }
                  : {
                      queryOrg,
                      setQueryOrg,
                      queryEmail,
                      setQueryEmail,
                      createdAt,
                      setCreatedAt,
                    }
              ),
          })),
        }}
        suffix={
          <div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setQueryFile(initialFilters.queryFile);
                  setQueryOrg(initialFilters.queryOrg);
                  setQueryEmail(initialFilters.queryEmail);
                  setCreatedAt(initialFilters.createdAt);
                }}
                className="w-[105px]"
              >
                Цэвэрлэх
              </Button>
            </div>
          </div>
        }
        onSuccess={() => {
          toast({
            title: "Амжилттай хадгалагдлаа.",
          });
        }}
        onError={(e) => {
          toast({
            variant: "destructive",
            title: `${e || e?.message || "Хүсэлт явуулах үед алдаа гарлаа"}`,
          });
        }}
      />
    </>
  );
};

export default FilesPage;
