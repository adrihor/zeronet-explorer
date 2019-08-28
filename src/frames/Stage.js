import React from 'react'

import {
    Platform,
    StyleSheet,
    ScrollView,
    Text,
    View
} from 'react-native'

import {
    Button,
    Header,
    Icon,
    SearchBar
} from 'react-native-elements'

import { Navigation } from 'react-native-navigation'

import { observable } from 'mobx'
import { observer } from 'mobx-react/native'
import stores from '../stores'

import {
    Shared
} from '../constants'

const ANDROID_DRAWER_RATIO = 0.80 // 80% of screen width

function _calcWidth() {
    /* Initialize device width. */
    const width = Shared.deviceWidth
    console.info('Device width used for Stage calc', width)

    /* Calc and return Android. */
    if (stores.App.isAndroid) {
        return Shared.deviceWidth * ANDROID_DRAWER_RATIO
    }

    /* Calc and return iOS. */
// TODO Let's hard-code ALL of the possible iOS values,
//      then use relative sizing for Android (best fit).

    /* Calc and return iOS. */
    if (width === 414) { // iPhone 8 Plus
        return Shared.deviceWidth - 130
    } else if (width > 375) {
        return Shared.deviceWidth - 150
    } else if (width > 320) {
        return Shared.deviceWidth - 85
    } else {
        return Shared.deviceWidth - 40 // small iOS devices (eg 4, 4s)
    }
}

@observer
export default class Stage extends React.Component {
    constructor(props) {
        super(props)

        /* Initialize search bar holder. */
        this.search = null

        /* Set the tag. */
        this.tag = props.tag

        // this._closeStage = this._closeStage.bind(this)
        this._closeZite = this._closeZite.bind(this)
        this._openButton = this._openButton.bind(this)
    }

    render() {
// FIXME Move to separate component
        function StageMenu(props) {
            /* Retrieve the parent. */
            const parent = props.parent

            return <Icon
                name='window-close'
                type='font-awesome'
                color='#fff'
                onPress={ parent._closeStage.bind(parent) } />
        }

        return <View style={ styles.container }>
            <Header
                backgroundColor={ stores.Stage.topBarColor }
                outerContainerStyles={ styles.topBar }
                innerContainerStyles={ styles.topBarContent }
                leftComponent={{}}
                centerComponent={{ text: stores.Stage.ziteTitle, style: styles.topBarTitle }}
                rightComponent={<StageMenu parent={ this } />} />

{/*
            <SearchBar
                ref={ search => this.search = search }
                icon={{ type: 'font-awesome', name: 'search' }}
                clearIcon={{ color: 'rgba(220, 90, 90, 0.35)', type: 'font-awesome', name: 'times-circle', style: { marginRight: 5 } }}
                inputStyle={ styles.searchInput }
                placeholder={ 'Search #' + stores.Stage.ziteTitle } />
*/}

            <ScrollView style={{ flex: 1 }}>
                <View style={ styles.contentContainer }>

                    { this._displayAddress() }
                    { this._displayDescription() }
                    { this._displayLastUpdate() }
                    { this._openButton() }
                    { this._displayFileList() }

                    <Text style={{ fontStyle: 'italic' }}>
                        { stores.Stage.debugLog }
                    </Text>
                </View>
            </ScrollView>

            { this._adManager() }
        </View>
    }

    componentDidMount() {

    }

    _closeStage() {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: { left: { visible: false } }
        })
    }

    _closeZite() {
        /* Close the webview. */
        Navigation.popTo('zeronet.Main')
            .catch(console.log)

        /* Close the stage. */
        this.closeStage()
    }

    _adManager() {
        if (stores.Stage.displayAds) {
            return <View style={ styles.adSpace }>
                <Text style={ styles.adSpaceText }>
                    BLOCKCHAIN AD SPACE
                </Text>
            </View>
        }
    }

    _displayAddress() {
        if (stores.Stage.ziteAddress) {
            return <View style={ styles.ziteDetails }>
                <Text style={ styles.ziteDetailsHeader }>
                    Zer0net Address
                </Text>
                <Text style={ styles.ziteDetailsText }>
                    { stores.Stage.ziteAddress }
                </Text>
            </View>
        }
    }

    _displayDescription() {
        if (stores.Stage.ziteAddress) {
            return <View style={ styles.ziteDetails }>
                <Text style={ styles.ziteDetailsHeader }>
                    Description
                </Text>
                <Text style={ styles.ziteDetailsText }>
                    { stores.Stage.ziteDescription }
                </Text>
            </View>
        }
    }

    _displayLastUpdate() {
        if (stores.Stage.ziteAddress) {
            return <View style={ styles.ziteDetails }>
                <Text style={ styles.ziteDetailsHeader }>
                    Last Updated
                </Text>
                <Text style={ styles.ziteDetailsText }>
                    { stores.Stage.ziteLastUpdate }
                </Text>
                <Text style={ styles.ziteDetailsText }>
                    { stores.Stage.ziteCachedAge }
                </Text>
            </View>
        }
    }

    _openButton() {
        if (stores.Stage.ziteAddress) {
            return <View style={{ marginTop: 10 }}>
                <Button
                    containerViewStyle={ styles.mainButtons }
                    borderRadius={ 3 }
                    onPress={ () => this._openZite() }
                    icon={{ name: 'window-restore', type: 'font-awesome' }}
                    title='OPEN ZITE' />
            </View>
        }
    }

    _displayVerification(_isValid) {
        if (_isValid) {
            return <Text>
                {'\n    '}File Verification: <Text style={ styles.passedText }>PASSED</Text>
            </Text>
        } else {
            return <Text>
                {'\n    '}File Verification: <Text style={ styles.failedText }>FAILED</Text>
            </Text>
        }
    }

    _bundledFileList() {
        let files = []
        let list = []
        let index = 0

        /* Retrieve the list of files. */
        files = stores.Stage.ziteFiles

        /* Update index. */
        index = files.length

        /* Reverse the list. */
        files = files.reverse()

        for (let file of files) {
            list.push(
                <Text key={ file['sha512'] } style={ styles.ziteDirectoryText }>
                    { index-- }. { file['name'] }
                    {'\n    '}Size: { file['size'] } bytes
                    { this._displayVerification(file['valid']) }
                </Text>
            )
        }

        return list
    }

    _displayFileList() {
        if (stores.Stage.ziteFiles.length > 0) {
            return <View style={ styles.ziteDetails }>
                <Text style={ styles.ziteDetailsHeader }>
                    File Directory
                </Text>
                { this._bundledFileList() }
            </View>
        }
    }

    _openZite() {
        /* Retrieve the address. */
        const address = stores.Stage.ziteAddress

        /* Initialize the path. */
        const path = 'index.html'

        /* Set the zite address. */
        stores.Stage.openZite(address, path)
    }

}

const styles = StyleSheet.create({
    container: {
        width: _calcWidth(),
        height: '100%',
        backgroundColor: stores.Stage.backgroundColor
    },
    contentContainer: {
        // margin: 20,
        padding: 15
    },

    topBar: {
        padding: 10,
        height: 56
    },
    topBarContent: {
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    topBarTitle: {
        width: '65%',
        color: '#fff',
        fontSize: 20
    },

    searchInput: {
        paddingLeft: 40,
        paddingBottom: Platform.OS === 'ios' ? 0 : 9
    },

    ziteDetails: {
        marginBottom: 10
    },
    ziteDetailsHeader: {
        color: 'rgba(180, 180, 180, 1.0)',
        fontSize: 20
    },
    ziteDetailsText: {
        color: 'rgba(235, 235, 235, 1.0)',
        fontSize: 12
    },
    ziteDirectoryText: {
        color: 'rgba(235, 235, 235, 0.7)',
        fontSize: 9,
        marginLeft: 20,
        marginBottom: 5
    },
    passedText: {
        color: 'rgba(30, 210, 30, 1.0)',
        fontWeight: 'bold'
    },
    failedText: {
        color: 'rgba(210, 30, 30, 1.0)',
        fontWeight: 'bold'
    },

    adSpace: {
        width: '100%',
        height: 50,
        padding: 15,
        // margin: 10,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'rgba(90, 220, 220, 0.9)'
    },
    adSpaceText: {
        fontSize: 20
    },

    recommendedStageText: {
        /* Set text color to off-white. */
        color: 'rgba(220, 220, 220, 1.0)',
    }
})
