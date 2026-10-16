import { Composition } from "remotion";
import { calculateEpisodeMetadata, Episode } from "./Episode";
import { RigTest } from "./RigTest";
import { StyleTest } from "./StyleTest";
import { Test } from "./Test";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Episode"
        component={Episode}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ episodeFile: "episodes/example/episode.json", episode: null }}
        calculateMetadata={calculateEpisodeMetadata}
      />
      <Composition id="RigTest" component={RigTest} durationInFrames={30} fps={30} width={1080} height={1920} />
      <Composition id="StyleTest" component={StyleTest} durationInFrames={240} fps={30} width={1080} height={1920} />
      <Composition
        id="Test"
        component={Test}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ title: "Amar Elshaer Dev" }}
      />
    </>
  );
};
