function Colors(props) {
    return (
        <Page>
            <Section
                title={<Text bold align="center">Color Settings</Text>}>
                <ColorSelect
                settingsKey="myColor"
                colors={[
                    {color: 'tomato'},
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