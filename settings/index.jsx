import * as util from '../common/utils';

const today = new Date();
const today_14days = new Date(Date.now() + 12096e5);

function generatePlaceholder(date){
    return `${util.zeroPad(date.getDate())}.${util.zeroPad(date.getMonth())}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
}

function setSettings(props) {
    return (
        <Page>
            <Toggle
                settingsKey="animation"
                label="Enable Animation"
            />
            <Section
                title={<Text bold align="center">Set start and end time</Text>}>
                <Text>Put you data and time in following format: "day.month.year hour:minute"</Text>
                <Text>Example: 22.10.2022 14:55</Text>
                <TextInput
                    label="Start time"
                    placeholder={generatePlaceholder(today)}
                    settingsKey="start_time"
                    onChange
                />
                <TextInput
                    label="End time"
                    placeholder={generatePlaceholder(today_14days)}
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

registerSettingsPage(setSettings);
