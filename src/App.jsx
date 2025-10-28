import { Navbar, Footer, ThreeSceneWrapper } from "./components";
import { projectsVideos } from "./constants";

function App() {
  return (
    <>
      <Navbar />
      <ThreeSceneWrapper videos={projectsVideos} />
      <Footer />
    </>
  );
}

export default App;
