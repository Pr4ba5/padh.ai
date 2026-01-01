import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const Tabroot = () => {
    return (

        <Tabs
            screenOptions={{
            headerShown: false, 
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
            tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
            },
            tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            },
        }}
      >
            <Tabs.Screen name="index" 
            options={{ 
                title: "Home",
                tabBarIcon: ({color}) => (
                    <FontAwesome size= {28} name= "home" color= {color}/>
                ),
                }} />

            
            <Tabs.Screen
                name="timetable"
                options={{
                title: "Timetable",
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="schedule" size={size} color={color} />
                ),
                }}
            />

            <Tabs.Screen name="mentor" options={{ 
                title: "Mentor",
                tabBarIcon: ({color, size}) => {
                    return (
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 50,
                            backgroundColor: "blue",
                            bottom: 15,
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <AntDesign size={28} name='open-ai' color={"white"} />
                        </View>
                    )
                }
                }} />

                <Tabs.Screen
                name="tasks"
                options={{
                title: "Tasks",
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="task-alt" size={size} color={color} />
                ),
                }}
            />

            <Tabs.Screen name="notes"
            options={{
                title: "Notes",
                tabBarIcon: ({color, size}) => (
                    <MaterialIcons name = "note-alt" size={28} color={"#4658f4ff"}/>
                ),
            }}
            />

        </Tabs>
    );
}


export default Tabroot;
