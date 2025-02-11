 renderControl: function TempComponent(f) {
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
