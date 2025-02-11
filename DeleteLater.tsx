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
