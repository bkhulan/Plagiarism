import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import generateApi from "@/api/generate";
import usePaths from "@/hooks/usePaths";
import { Input } from "@/components/ui/input";
import ModelOrgWorkers from "@/models/OrgWorkers";
import Crud from "@/packages/crud";
import OrgDetail from "./Org/OrgsInfo";
import { toast } from "@/components/ui/use-toast";
import { useDebounce } from "@uidotdev/usehooks";

interface IProps {}

const PageOrgsDetail = (props: IProps) => {
  const { id } = useParams();
  const { paths, setPaths } = usePaths();
  const [query, setQuery] = React.useState("");
  const search = useDebounce(query, 300);
  const filters = { search };

  const { data, isLoading, error, refetch } = useQuery(
    ["orgs", id],
    () => id && generateApi("org").findOne(id),
    {
      onSuccess: (data) => {
        if (!paths?.find((p) => p.label === data?.data?.Name)) {
          setPaths([{ label: data?.data?.Name }]);
        }
      },
    }
  );

  useEffect(() => {
    return () => setPaths([]);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="pt-4">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="info">Ерөнхий мэдээлэл</TabsTrigger>
          <TabsTrigger value="workers">Хэрэглэгчид</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <OrgDetail
            {...{
              data,
            }}
            refetch={refetch}
          />
        </TabsContent>
        <TabsContent value="workers">
          <Crud
            key={`workers_${id}`}
            model={{
              ...ModelOrgWorkers,
              filters,
              api: {
                ...generateApi("org/worker"),
                find: (data) => {
                  return generateApi(`org/worker/${id}`).find(data);
                },
                insert: (data) => {
                  const d = {
                    newOrgWorkers: [
                      {
                        email: data?.email,
                        roleId: data?.id,
                      },
                    ],
                    organizationId: Number(id),
                  };
                  return generateApi("org/worker").insert(d).then(() => {
                    toast({
                      title: "tst",
                    });
                  }).catch(() => {
                    toast({
                      variant: "destructive",
                      title: "��эрэглэгчийн нэр болон утас тодорхойлогдох ��ед алдаа гарлаа",
                    });
                  });
                },
                delete: (data) => {
                  const d = {
                    UserIds: [data?.id],
                  };
                  return generateApi(`org/worker`).delete({
                    id,
                    data: d,
                  });
                },
              },
            }}
            suffix={
              <>
                <Input
                  placeholder="Хайлт..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                />
              </>
            }
            onSuccess={() => {
              refetch();
              toast({
                title: "Амжилттай хадгалагдлаа.",
              });
            }}
            onError={(e) => {
              toast({
                variant: "destructive",
                title: `${
                  e || e?.message || "Хүсэлт явуулах үед алдаа гарлаа"
                }`,
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PageOrgsDetail;
