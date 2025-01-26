import im from "@renderer/assets/isabelle_mad.gif";
import animalCrossingSound from "@renderer/assets/isabelle-talk.mp3";
import shockedSound from "@renderer/assets/shocked.mp3";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useEffect } from "react";
import Typewriter from "typewriter-effect";
import { Button } from "@renderer/components/ui/button";

const queryClient = new QueryClient();

function App(): JSX.Element {
  useEffect(() => {
    const playAudioSequence = async (): Promise<void> => {
      const shockedAudio = new Audio(shockedSound);
      const talkAudio = new Audio(animalCrossingSound);

      try {
        await shockedAudio.play();
        await talkAudio.play();
        // shockedAudio.addEventListener('ended', async () => {
        //   await talkAudio.play();
        // });
      } catch (error) {
        console.error(`Error playing audio:`, error);
      }
    };

    playAudioSequence();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <div className="flex h-screen flex-col items-center pb-12 font-round">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            src={im}
            alt="Isabelle looking mad"
            className="h-[360px] w-[360px] object-cover"
          />
          <div className="relative flex h-[360px] w-[720px] flex-none">
            <div className="relative flex h-full w-full scale-0 transform animate-scaleUp flex-col items-center justify-stretch">
              <div className="absolute top-0 h-[75%] w-full origin-center animate-blob rounded-[40%_40%_30%_30%/150%_150%_150%_150%] bg-[#fdf8e3]"></div>
              <div className="absolute bottom-0 h-[40%] w-[94%] origin-center animate-blob rounded-[5%_5%_20%_20%/100%_100%_100%_100%] bg-[#fdf8e3]"></div>
              <div className="absolute w-full px-16 pb-8 pt-12 text-3xl leading-[1.5em] text-[#807256]">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .changeDelay(20)

                      .typeString(
                        `What a great night to watch the shooting stars. You should try making a wish and see what happens!`
                      )
                      .start();
                  }}
                />
                {/* What a great night to watch the shooting stars. You should try
              making a wish and see what happens! */}
              </div>
            </div>
            <div className="absolute animate-character">
              <div className="perspective-[2rem] rotate-x-1 -rotate-z-6 mr-auto inline-block -translate-y-[45%] translate-x-[20%] scale-0 transform animate-fadeCharacter rounded-[30%/100%_100%_120%_120%] bg-[#dd8530] px-8 py-2 text-2xl text-[#482016]">
                Dobby
              </div>
            </div>
          </div>
          <Button asChild size="xl">
            <motion.button
              className="absolute bottom-10 left-1/2 z-50 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5 }}
              onClick={() => {
                window.close();
              }}
            >
              Apologize to Dobby
            </motion.button>
          </Button>
        </div>
      </>
    </QueryClientProvider>
  );
}

export default App;
