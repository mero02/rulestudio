
import { useState } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Home from './pages/Home';
import Autoevaluacion from './pages/Autoevaluacion';

function App() {
  return (
    <Tabs variant="enclosed" colorScheme="brand">
      <TabList>
        <Tab>Modo Clásico</Tab>
        <Tab>Autoevaluación</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Home />
        </TabPanel>
        <TabPanel>
          <Autoevaluacion />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default App;
