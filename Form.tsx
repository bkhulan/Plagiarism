import { useFormik, getIn } from "formik";
import useModel from "../hooks/useModel";
import { IField } from "../models";
import Wrapper from "../components/Wrapper";

import { Flex, Text } from "@radix-ui/themes";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import * as Yup from "yup";
import CheckboxGroup from "../components/CheckboxGroup";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "react-query";
import LoadingOverlay from "@/components/custom-ui/LoadingOverlay";
import languages from "@/utils/languages";
import { useEffect, useState } from "react";
import Editor from "../components/Editor";
import CustomDatePicker from "../components/DatePicker";
import CustomDateTimePicker from "../components/DateTimePicker";
import Upload from "../components/Upload";
import ArrayField from "../components/ArrayField";
import { Loader2, Target } from "lucide-react";
import CustomPassword from "../components/Password";
import FileUpload from "../components/FileUpload";
import Relational from "../components/Relational";
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";

interface IProps {
  onSuccess?: (res: any) => void;
  onError?: (e: any) => void;
  data?: any;
}
const Form = (props: IProps) => {
  const [loading, setLoading] = useState(false);
  const { data } = props;
  const model = useModel();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutationUpload = useMutation(model.api.upload, {
    onSuccess: (res) => {
      queryClient.invalidateQueries([model.name]);
      props?.onSuccess && props?.onSuccess(res);
    },
    onError: (e) => {
      if (e && typeof e === "object" && "response" in e) {
        const errorMessage = (e as any)?.response?.data?.error || "Алдаа гарлаа.";
        props?.onError && props?.onError(errorMessage);
      } else {
        props?.onError && props?.onError("Алдаа гарлаа.");
      }
      // props?.onError && props?.onError(e);
      // setLoading(false);
    },
  });

  const mutationInsert = useMutation(model.api.insert, {
    onSuccess: (res) => {
      queryClient.invalidateQueries([model.name]);
      props?.onSuccess && props?.onSuccess(res);
    },
    onError: (e) => {
      props?.onError && props?.onError(e);
      setLoading(false);
      // alert(e);
    },
  });
  const mutationUpdate = useMutation(model.api.update, {
    onSuccess: (res) => {
      queryClient.invalidateQueries([model.name]);
      props?.onSuccess && props?.onSuccess(res);
    },
    onError: (e) => {
      props?.onError && props?.onError(e);
      setLoading(false);
    },
  });

  const formik = useFormik({
    initialValues: model?.fields
      ?.filter((f) => f)
      .reduce((result, field) => {
        return {
          ...result,
          [field.name]: field.hasLanguages
            ? languages
                ?.map((lang) => lang.code)
                .reduce((s, n) => {
                  return { ...s, [n]: "" };
                }, {})
            : typeof field.defaultValue === "undefined"
            ? ""
            : field.defaultValue,
        };
      }, {}),
    validationSchema: Yup.object().shape(
      model?.fields
        ?.filter((f) => {
          return (data && !f.hideIn?.update) || (!data && !f?.hideIn?.create);
        })
        ?.filter((f) => !f?.hasLanguages && f?.validate)
        .reduce((result, field) => {
          return { ...result, [field.name]: field.validate };
        }, {})
    ),
    onSubmit: async (values) => {
      if (!loading) {
        setLoading(true);
        function isNumeric(value) {
          return /^-?\d+$/.test(value);
        }

        const tmpValues = {};
        const uploads = {};
        const fieldNames = fields.map((f) => f.name);
        Object.keys(values).forEach((key) => {
          const tmpField = fields?.find((f) => f.name === key);
          if (fieldNames.includes(key)) {
            // if (
            //   typeof values[key] === "string" &&
            //   isNumeric(values[key]) &&
            //   tmpField?.type === "number"
            // ) {
            //   tmpValues[key] = Number.parseFloat(values[key]);
            // } else if (
            //   typeof values[key] === "string" &&
            //   values[key]?.trim() !== ""
            // ) {
            //   tmpValues[key] = values[key];
            // } else if (typeof values[key] !== "string") {
            //   if (values[key] instanceof File) {
            //     uploads[key] = mutationUpload.mutateAsync(values[key]);
            //   } else {
            //     tmpValues[key] = values[key];
            //   }
            // } else {
            //   tmpValues[key] = values[key];
            // }

            if (typeof values[key] !== "string") {
              if (values[key] instanceof File) {
                uploads[key] = mutationUpload.mutateAsync(values[key]);
              } else {
                tmpValues[key] = values[key];
              }
            } else {
              tmpValues[key] = values[key];
            }
          }
        });

        const files = await Promise.all(
          Object.keys(uploads).map((k) => uploads[k])
        );

        Object.keys(uploads).forEach((key, i) => {
          tmpValues[key] = files[i];
        });
        try {
          if (data) {
            await mutationUpdate.mutateAsync({
              ...tmpValues,
              id: data.id,
            });
          } else {
            await mutationInsert.mutateAsync(tmpValues);
          }
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Error",
            description: (err as Error).message || "Алдаа гарлаа!",
          });
        }
        setLoading(false);
      }
    },
  });

  const getInput = (field: IField, tmpData?: any) => {
    const commonProps = {
      name: field.name,
      onChange: formik.handleChange,
      value: getIn(formik.values, field.name),
    };

    if (
      field.type === "text" ||
      field.type === "number" ||
      field.type === "email" ||
      field.type === "password"
    ) {
      return field.type === "password" ? (
        <CustomPassword
          type={field.type}
          {...commonProps}
          onChange={(e) => {
            formik.setFieldValue(commonProps.name, e.target.value);
            formik.setTouched({ ...formik.touched, [commonProps.name]: true });
          }}
        />
      ) : (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          {...commonProps}
        />
      );
    } else if (field.type === "textarea") {
      return <Textarea {...commonProps} />;
    } else if (field.type === "select") {
      return (
        <Select
          onValueChange={(value) => {
            formik.setFieldValue(commonProps.name, value);
          }}
          value={commonProps?.value?.toString()}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Сонгох" />
          </SelectTrigger>
          <SelectContent>
            {field?.options?.map((option, i) => (
              <SelectItem
                key={`option-${option?.value}-${i}`}
                value={option?.value?.toString()}
              >
                {option?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (field.type === "checkbox") {
      return (
        <>
          <CheckboxGroup
            {...commonProps}
            options={field?.options}
            onChange={(values) => {
              formik.setFieldValue(field.name, values);
            }}
          />
        </>
      );
    } else if (field.type === "radio") {
      return (
        <>
          <RadioGroup
            defaultValue={field.defaultValue || ""}
            onValueChange={(value) => {
              formik.setFieldValue(commonProps.name, value);
            }}
            value={commonProps.value}
          >
            <Flex gap="2" direction="column">
              {field?.options?.map((option, i) => (
                <label key={`form-${field.name}-option-${option.value}-${i}`}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={option?.value} />
                    <Text size="2">{option?.label}</Text>
                  </div>
                </label>
              ))}
            </Flex>
          </RadioGroup>
        </>
      );
    } else if (field.type === "rte") {
      const [fieldName, locale] = field.name?.split(".");
      return (
        <Editor
          key={`${field.name}-${
            (locale
              ? tmpData?.[fieldName]?.[locale]
              : tmpData?.[field?.name]) ||
            commonProps.value ||
            field.defaultValue ||
            ""
              ? "update"
              : "create"
          }`}
          defaultValue={
            (locale
              ? tmpData?.[fieldName]?.[locale]
              : tmpData?.[field?.name]) ||
            commonProps.value ||
            field.defaultValue ||
            ""
          }
          onChange={(value) => {
            formik.setFieldValue(commonProps.name, value);
          }}
        />
      );
    } else if (field.type === "custom") {
      return (
        field?.renderCustom &&
        field?.renderCustom(formik, {
          ...commonProps,
          value: commonProps?.value || field?.defaultValue?.mn || [],
          onChange: (value) => {
            formik.setFieldValue(commonProps.name, value);
          },
        })
      );
    } else if (field.type === "date") {
      return (
        <Input
          key={`${field.name}`}
          type="date"
          value={
            (commonProps?.value
              ? moment(commonProps?.value).format("YYYY-MM-DD")
              : "") as any
          }
          defaultValue={
            commonProps?.value
              ? moment(commonProps?.value)?.format("YYYY-MM-DD")
              : (field.defaultValue &&
                  moment(field.defaultValue).format("YYYY-MM-DD")) ||
                ""
          }
          onChange={(e) => {
            formik.setFieldValue(
              commonProps.name,
              new Date(e.target.value).getTime()
            );
          }}
        />
      );
    } else if (field.type === "datepicker") {
      return (
        <CustomDatePicker
          key={`${field.name}`}
          value={commonProps?.value}
          defaultValue={
            commonProps?.value ||
            (field.defaultValue && new Date(field.defaultValue).getTime())
          }
          onChange={(value) => {
            formik.setFieldValue(commonProps.name, new Date(value).getTime());
          }}
        />
      );
    } else if (field.type === "datetime") {
      return (
        <CustomDateTimePicker
          key={`${field.name}`}
          defaultValue={commonProps.value || field.defaultValue || ""}
          onChange={(value) => {
            formik.setFieldValue(commonProps.name, new Date(value).getTime());
          }}
        />
      );
    } else if (field.type === "image") {
      return (
        <Upload
          key={`${field.name}`}
          defaultValue={commonProps.value || field.defaultValue || ""}
          onChange={(value) => {
            formik.setFieldValue(commonProps.name, value);
          }}
        />
      );
    } else if (field.type === "file") {
      return (
        <FileUpload
          key={`${field.name}`}
          defaultValue={commonProps.value || field.defaultValue || ""}
          onChange={(value) => {
            formik.setFieldValue(commonProps.name, value);
          }}
        />
      );
    } else if (field.type === "array") {
      return (
        <ArrayField
          key={`${field.name}`}
          defaultValue={commonProps.value || field.defaultValue || []}
          onChange={(values) => {
            formik.setFieldValue(commonProps.name, values);
          }}
        />
      );
    } else if (field?.type === "relational") {
      return (
        <Relational
          tableName={field?.tableName}
          getOptions={field?.getOptions}
          value={commonProps.value || field.defaultValue || []}
          onChange={(values) => {
            formik.setFieldValue(commonProps.name, values);
          }}
          multiple={field?.multiple}
        />
      );
    }
  };

  const languageFields = model.fields?.filter((f) => f.hasLanguages);

  useEffect(() => {
    if (data) {
      formik.setValues(data);
    }
  }, [data]);

  // Main fields
  const fields = model?.fields?.filter((field) => {
    return (
      !field.hideIn ||
      !(
        field.hideIn &&
        ((!data && field.hideIn?.create) || (data && field.hideIn?.update))
      )
    );
  });

  return (
    <>
      <LoadingOverlay
        visible={
          mutationInsert.isLoading || mutationUpdate.isLoading || loading
        }
      />
      <form name="crud-form" onSubmit={formik.handleSubmit}>
        {languageFields?.length > 0 ? (
          <>
            <Tabs
              defaultValue={languages?.find((lang) => lang.isDefault)?.code}
              className="w-full"
            >
              <TabsList className="mb-2">
                {languages?.map((lang) => (
                  <TabsTrigger value={lang?.code}>{lang.title}</TabsTrigger>
                ))}
              </TabsList>
              {languages?.map((lang) => (
                <TabsContent value={lang.code}>
                  {fields
                    .filter((field) => {
                      return lang.isDefault || field.hasLanguages;
                    })
                    .map((field, i) => (
                      <Wrapper
                        key={`form-field-${field.name}-${i}`}
                        {...{
                          formik,
                          field: {
                            ...field,
                            name: field.hasLanguages
                              ? `${field.name}.${lang.code}`
                              : field.name,
                          },
                        }}
                      >
                        {getInput(
                          {
                            ...field,
                            name: field.hasLanguages
                              ? `${field.name}.${lang.code}`
                              : field.name,
                          },
                          data
                        )}
                      </Wrapper>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          (fields || []).map((field, i) => (
            <Wrapper
              key={`form-field-${field.name}-${i}`}
              {...{ formik, field }}
            >
              {getInput(field, data)}
            </Wrapper>
          ))
        )}
        <div className="flex items-center justify-end py-2">
          <Button
            type="submit"
            disabled={
              mutationInsert.isLoading || mutationUpdate.isLoading || loading
            }
          >
            {(mutationInsert.isLoading ||
              mutationUpdate.isLoading ||
              loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Хадгалах
          </Button>
        </div>
      </form>
    </>
  );
};

export default Form;
