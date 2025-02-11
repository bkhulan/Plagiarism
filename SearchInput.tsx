{
      name: "fileName",
      type: "file",
      label: "Нэрfff",
      placeholder: "Нэр",
      validate: Yup.mixed().required("Файл оруулна уу!"),
      renderControl: function TempComponent(f) {
        const [value, onChange] = useState("");
        const [open, setOpen] = useState(false);
        return (
          <div>
            <Popover.Root open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <Button className="bg-gray-200 p-2 rounded-lg flex items-center justify-center">
                  <Search size={18} className="text-gray-600" />
                </Button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  className="w-[350px] bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50"
                  side="bottom"
                  align="start"
                  sideOffset={5}
                  // onInteractOutside={(e) => e.preventDefault()}
                >
                  <div>
                    <Input
                      placeholder="Хайх..."
                      value={value}
                      onChange={(e) => {
                        onChange(e.target.value);
                        f?.setQueryFile?.(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-[10px]">
                    <Button
                      className="border"
                      onClick={() => {
                        onChange("");
                        f?.setQueryFile?.("");
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="text-blue-500"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        );
      },
    },
