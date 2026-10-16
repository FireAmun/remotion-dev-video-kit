import { AbsoluteFill, Sequence } from "remotion";
import { CardShell } from "./components/CardShell";
import { EndCard } from "./components/cards/EndCard";
import { GoldDust, KineticText, SplitFlap } from "./scene/Styles";
import { SetBack } from "./sets/Sets";
import { theme } from "./theme";

// Visual check for the style kit: blueprint + split-flap, kinetic type, glass card, art-deco end card.
const Center: React.FC<{ readonly top: number; readonly children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", justifyContent: "center" }}>{children}</div>
);

export const StyleTest: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={60}>
      <SetBack name="blueprint" />
      <GoldDust />
      <Center top={420}>
        <SplitFlap text="196" label="mouth moves" size={170} />
      </Center>
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <SetBack name="stage" />
      <GoldDust />
      <Center top={380}>
        <KineticText text="No AI did that." highlight={["AI"]} stagger={5} size={130} />
      </Center>
    </Sequence>
    <Sequence from={120} durationInFrames={60}>
      <SetBack name="coderoom" />
      <GoldDust />
      <Center top={420}>
        <CardShell style={{ width: 900 }}>
          <div style={{ fontFamily: theme.fonts.mono, fontSize: 46, color: theme.colors.text }}>rms[f] = Math.sqrt(sum / n)</div>
        </CardShell>
      </Center>
    </Sequence>
    <Sequence from={180} durationInFrames={60}>
      <SetBack name="stage" />
      <GoldDust />
      <Center top={420}>
        <div style={{ width: 960 }}>
          <EndCard url="amarhassan.com" cta="Follow for tomorrow's tip" />
        </div>
      </Center>
    </Sequence>
  </AbsoluteFill>
);
