function Colors(props) {
    return (
        <Page>
            <Toggle
                settingsKey="animation"
                label="Enable Animation"
            />
            <Section
                title={<Text bold align="center">Set start and end time</Text>}>
                <TextInput
                    action="Add Item"
                    label="Start time"
                    placeholder="09.09.2022 10:00"
                    settingsKey="start_time"
                />
                <TextInput
                    action="Add Item"
                    label="End time"
                    placeholder="09.09.2022 10:00"
                    settingsKey="end_time"
                />
            </Section>
            <Section
                title={<Text bold align="center">Moon color</Text>}>
                <ColorSelect
                settingsKey="moon_color"
                colors={[
                    {color: '#afadb3'},
                    {color: 'sandybrown'},
                    {color: 'gold'},
                    {color: 'aquamarine'},
                    {color: 'deepskyblue'},
                    {color: 'plum'}
                ]}
                />
            </Section>
        </Page>
    );
}

registerSettingsPage(Colors);