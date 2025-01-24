import React, { useRef } from "react";
import generateApi from "@/api/generate";
import { IModel } from "@/packages/crud/models";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import {
  CheckIcon,
  PlusIcon,
  ExitIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Tooltip from "@/components/custom-ui/Tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import { Flex } from "@radix-ui/themes";
import * as Toggle from "@radix-ui/react-toggle";
import ToggleActive from "@/components/crud/ToggleActive";
import { toast } from "@/components/ui/use-toast";
import * as Yup from "yup";

const ModelOrgs: IModel = {
  name: "organizations",
  crud: { update: true, read: false },
  collectionName: "organizations",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Байгууллагын нэр",
      placeholder: "Байгууллагын нэр",
      hideIn: { view: true },
      validate: Yup.string().required("Байгууллагын нэрийг оруулна уу!"),
      render(_, values) {
        return (
          <Link to={`/orgs/${values?.id}`}>
            <div className="flex items-center space-x-2">
              <div>{values?.name}</div>
            </div>
          </Link>
        );
      },
    },
    {
      name: "abbreviation",
      type: "text",
      label: "Товчлол",
      placeholder: "Товчлол",
      validate: Yup.string().required(
        "Байгууллагын нэрийн товчлолыг оруулна уу!"
      ),
    },
    {
      name: "countryId",
      type: "select",
      label: "Улс",
      render(value, values, i, handleRequest) {
        const countryData = useQuery(["country"], () =>
          generateApi("country").find({
            pagesize: 10,
            pagenumber: 1,
          })
        );
        const selectedCountry = (countryData?.data || [])?.find(
          (option: any) => option?.id === value || ""
        );
        return (
          <div className="flex items-center space-x-2">
            {selectedCountry?.name}
          </div>
        );
      },
      RenderInput: (formik) => {
        const [country, setCountry] = useState<Array<any>>([]);
        const [search, setSearch] = useState("");
        const [filteredOptions, setFilteredOptions] = useState<Array<any>>([]);
        const [isOpen, setIsOpen] = useState(false);
        const [isAdding, setIsAdding] = useState(false);
        const [editingId, setEditingId] = useState<string | null>(null);

        const inputRef = useRef<HTMLInputElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const { toast } = useToast();

        const countryData = useQuery(["country"], () =>
          generateApi("country").find()
        );

        const mutationAddCountry = useMutation(generateApi("country").insert, {
          onSuccess: () => {
            countryData.refetch();
            toast({
              title: "Амжилттай нэмэгдлээ.",
            });
          },
          onError: (e: any) => {
            toast({
              variant: "destructive",
              title: "Алдаа гарлаа.",
            });
          },
        });

        const mutationDeleteCountry = useMutation(
          generateApi("country").delete,
          {
            onSuccess: () => {
              toast({
                variant: "default",
                title: "Амжилттай устгагдлаа.",
              });
              countryData.refetch();
            },
            onError: (e: any) => {
              const errorMessage =
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e?.message ||
                "Алдаа гарлаа";

              toast({
                variant: "destructive",
                title: errorMessage,
              });
            },
          }
        );

        const mutationUpdateCountry = useMutation(
          generateApi("country").update,
          {
            onSuccess: () => {
              countryData.refetch();
              toast({
                title: "Амжилттай шинэчилэгдлээ.",
              });
            },
            onError: (e: any) => {
              console.log("error", e);
              toast({
                variant: "destructive",
                title: "Алдаа гарлаа.",
              });
            },
          }
        );

        useEffect(() => {
          if (countryData?.data?.length > 0) {
            const options = countryData.data.map((e: any) => ({
              label: e?.name,
              value: e?.id,
            }));
            setCountry(options);
            setFilteredOptions(options);

            const selectedCountry = options.find(
              (option) => option.value === formik?.values?.id
            );
            if (selectedCountry) {
              setSearch(selectedCountry.label);
            }
          }
        }, [countryData?.data, formik?.values?.id]);

        useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
            if (
              inputRef.current &&
              !inputRef.current.contains(event.target as Node) &&
              dropdownRef.current &&
              !dropdownRef.current.contains(event.target as Node)
            ) {
              setIsOpen(false);
            }
          };

          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, []);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          setSearch(value);
          setIsOpen(true);
          setFilteredOptions(
            country.filter((option) =>
              option.label.toLowerCase().includes(value.toLowerCase())
            )
          );
        };

        const handleUpdateCountry = (id: string, newName: string) => {
          if (newName.trim()) {
            mutationUpdateCountry.mutateAsync({
              name: newName.trim(),
              id: id,
            });
            setEditingId(null);
          }
        };

        const toggleAdding = () => {
          setIsAdding(!isAdding);
          setSearch("");
        };

        return (
          <div className="relative w-full">
            <div className="flex items-center space-x-2">
              {isAdding ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Шинэ улс нэмэх..."
                    className="w-full border rounded-md p-2 text-sm"
                  />
                  <Tooltip label="Засах">
                    <Button
                      onClick={() => {
                        if (search) {
                          mutationAddCountry.mutateAsync({
                            name: search.trim(),
                          });
                        }
                        setSearch("");
                        setIsAdding(false);
                      }}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip label="Устгах">
                    <Button onClick={toggleAdding}>
                      <ExitIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={handleInputChange}
                    placeholder="Хайх..."
                    className="w-full border rounded-md p-2 text-sm"
                    onFocus={() => setIsOpen(true)}
                  />
                  {/* <Tooltip label="Нэмэх">
                    <Button onClick={toggleAdding}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip> */}
                </>
              )}
            </div>
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border rounded-md bg-white text-sm shadow-lg"
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-red-100 cursor-pointer"
                      onClick={() => {
                        setSearch(option.label);
                        formik.setFieldValue("countryId", option.value);
                        setIsOpen(false);
                      }}
                    >
                      {editingId === option.value ? (
                        <div className="w-[80%]">
                          <Input
                            type="text"
                            defaultValue={option.label}
                            className="border p-1 rounded-md border-b-[green]"
                            onChange={(e) => {
                              handleUpdateCountry(option.value, e.target.value);
                            }}
                            // onKeyDown={(e) => {
                            //   if (e.key === "Enter") handleUpdateCountry(option.value, ededititingValue);
                            //   if (e.key === "Escape") setEditingId(null);
                            // }}
                          />
                        </div>
                      ) : (
                        <span>{option.label}</span>
                      )}
                      {/* <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            // setIsOpen(false);
                            setEditingId(
                              editingId === option.value ? null : option.value
                            );
                          }}
                        >
                          <Pencil1Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            mutationDeleteCountry
                              .mutateAsync(option.value)
                              .then(() => {})
                          }
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div> */}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No options found</div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      name: "totalWorker",
      type: "text",
      label: "Нийт ажилчдын тоо",
      placeholder: "Нийт ажилчдын тоо",
      render: (value: any) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {value}
          </div>
        );
      },
    },
    {
      name: "plagiarismCount",
      type: "text",
      label: "Нийт үгийн тоо",
      placeholder: "Нийт үгийн тоо",
      render: (value: any) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {value}
          </div>
        );
      },
    },
    {
      name: "orgType",
      type: "select",
      label: "Төрөл",
      options: [
        {
          label: "Private",
          value: "Private",
        },
        {
          label: "Public",
          value: "Public",
        },
        {
          label: "Online",
          value: "Online",
        },
      ],
    },
    {
      name: "isActive",
      type: "select",
      label: "Төлөв",
      options: [
        {
          label: "Идэвхтэй",
          value: true,
        },
        {
          label: "Идэвхгүй",
          value: false,
        },
      ],
      render: (value, row, i, handleRequest) => {
        return (
          <ToggleActive
            checked={row?.isActive}
            handleRequest={(checked) => {
              handleRequest &&
                handleRequest(async () => {
                  try {
                    const res = await generateApi("org/active").update({
                      id: row?.id,
                      isActive: checked ? true : false,
                    });
                    toast({
                      title: "Амжилттай хадгалагдлаа.",
                    });
                    return res;
                  } catch (e: any) {
                    toast({
                      variant: "destructive",
                      title: `${
                        e || e?.message || "Хүсэлт явуулах үед алдаа гарлаа."
                      }`,
                    });
                  }
                });
            }}
          />
        );
      },
    },
    {
      name: "contactNumber",
      type: "text",
      label: "Утас",
      placeholder: "Утас",
      validate: Yup.string()
        .required("Утасны дугаарыг оруулна уу!")
        .matches(/^[0-9]{8}$/, "Утасны дугаар 8 оронтой байх ёстой."),
    },
    {
      name: "email",
      type: "email",
      label: "Имэйл",
      placeholder: "Имэйл",
      validate: Yup.string().email("").required("Имэйл хаягыг оруулна уу!"),
    },
    {
      name: "adminEmail",
      type: "email",
      label: "Админ имэйл",
      placeholder: "Админ имэйл",
      hideIn: { update: true, list: true },
      validate: Yup.string()
        .email("")
        .required("Админ имэйл хаягыг оруулна уу!"),
    },
    {
      name: "orgCode",
      type: "text",
      label: "Байгууллагын дугаар",
      placeholder: "Байгууллагын дугаар",
      hideIn: { create: true, list: true },
      validate: Yup.string().required("Байгууллагын дугаарыг оруулна уу!"),
    },
    {
      name: "websiteUrl",
      type: "text",
      label: "Веб хаяг",
      placeholder: "Веб хаяг",
      hideIn: { create: true, list: true },
      validate: Yup.string()
        .url("Зөв веб хаяг оруулна уу!")
        .required("Веб хаяг оруулна уу!"),
    },
    {
      name: "address",
      type: "text",
      label: "Хаяг",
      placeholder: "Хаяг",
      hideIn: { create: true, list: true },
      validate: Yup.string().required("Байгууллагын хаягыг оруулна уу!"),
    },
    {
      name: "establishYear",
      type: "number",
      label: "Байгуулагдсан он",
      placeholder: "Байгуулагдсан он",
      hideIn: { create: true, list: true },
      validate: Yup.number()
        .required("Байгуулагдсан оныг оруулна уу!")
        .typeError("Зөвхөн тоо оруулна уу!")
        .integer("Зөвхөн бүхэл тоо оруулна уу!")
        .min(1800, "1800 оноос хойш байх ёстой!")
        .max(new Date().getFullYear(), "Ирээдүйн он байх ёсгүй!"),
    },
    {
      type: "text",
      label: "Үүсгэсэн огноо",
      name: "createdAt",
      hideIn: { list: false, create: true, update: true},
      render: (value: any) => {
        return dayjs(value).format("YYYY-MM-DD HH:mm");
      },
    },
  ],
  api: {
    ...generateApi("org"),
  },
};

export default ModelOrgs;
