import Crud from "@/packages/crud";
import ModelOrganization from "../models/Orgs";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useDebounce } from "@uidotdev/usehooks";
import * as React from "react";
import generateApi from "@/api/generate";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import CustomDatePicker from "@/components/DatePicker";
import { X } from "lucide-react";
import { format } from "date-fns";

interface IProps {}

interface FilterState {
  isActive: boolean | undefined;
  setIsActive: (value: boolean | undefined) => void;
  queryOrg: string;
  setQueryOrg: (value: string) => void;
  createdAt: Date | string | null;
  setCreatedAt: (value: Date | string | null) => void;
}

const OrgsPage = (props: IProps) => {
  const initialFilters = {
    org: "",
    isActive: { label: "Бүгд", value: undefined },
    createdAt: { from: undefined, to: undefined },
  };

  const [queryOrg, setQueryOrg] = React.useState(initialFilters.org);
  const [isActive, setIsActive] = React.useState<any>(initialFilters.isActive);
  const [createdAt, setCreatedAt] = React.useState<any>(
    initialFilters.createdAt
  );

  const filterState: FilterState = {
    queryOrg,
    setQueryOrg,
    isActive,
    setIsActive,
    createdAt,
    setCreatedAt
  };

  const name = useDebounce(queryOrg, 300);
  const isactive = isActive?.value;
  const createdatstart = createdAt.from
    ? format(new Date(createdAt.from), "yyyy-MM-dd")
    : undefined;
  const createdatend = createdAt.to
    ? format(new Date(createdAt.to), "yyyy-MM-dd")
    : undefined;
  const filters = { isactive, createdatstart, createdatend, name };

  return (
    <>
      <Crud
        model={{
          ...ModelOrganization,
          filters,
          api: {
            ...generateApi("org"),
          },
          fields: ModelOrganization.fields.map((f: any) => ({
            ...f,
            renderControl: () => f.renderControl && f.renderControl(filterState),
          })),
          // fields: ModelOrganization.fields.map((f: any) => ({
          //   ...f,
          //   // renderControl: f.name === "name" ? f.renderControl : undefined,
          //   renderControl:
          //     f.name === "name"
          //       ? () => f.renderControl(queryOrg, setQueryOrg)
          //       : undefined,
          // })),
        }}
        suffix={
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setQueryOrg(initialFilters.org);
                  setIsActive(initialFilters.isActive);
                  setCreatedAt(initialFilters.createdAt);
                }}
                className="w-[105px]"
              >
                Цэвэрлэх
              </Button>
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

export default OrgsPage;
