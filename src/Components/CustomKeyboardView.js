import {View, Text, KeyboardAvoidingView,  ScrollView, Platform} from 'react-native'
import React from 'react'
const ios = Platform.OS = 'ios';
const CustomKeyboardView = ({children}) => {
   
    let kavConfig = {};
    let scrollViewConfig = {};
    
    return (
        <KeyboardAvoidingView
        behavior={ios? 'padding': 'height'}
        // Pushes keyboard up
        {...kavConfig}
        style={{flex: 1}}>

            <ScrollView
            style={{flex: 1}}
            // If keyboard issue
            bounces={false}
            showsVerticalScrollIndicator={false}
            {...scrollViewConfig}
            >
            {
                children
            }
            </ScrollView>
            </KeyboardAvoidingView>
    )
}
export default CustomKeyboardView;