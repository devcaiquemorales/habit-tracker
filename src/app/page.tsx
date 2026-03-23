import { CreateHabitDialog } from "@/presentation/components/create-habit-dialog";
import { HabitCard } from "@/presentation/components/habit-card";
import { HomeHeader } from "@/presentation/components/home-header";
import { MOCK_HABITS } from "@/presentation/data/mock-habits";

export default function Home() {
  return (
    <>
      <main className="flex flex-col pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <div
          className="mx-auto flex w-full flex-col gap-6 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] lg:max-w-4xl lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] xl:pl-[calc(2.5rem+env(safe-area-inset-left,0px))] xl:pr-[calc(2.5rem+env(safe-area-inset-right,0px))]"
        >
          <HomeHeader />

          <div className="flex flex-col gap-4">
            {MOCK_HABITS.map((habit) => (
              <HabitCard
                key={habit.id}
                habitId={habit.id}
                name={habit.name}
                schedule={habit.schedule}
                streak={habit.streak}
                colorVariant={habit.colorVariant}
              />
            ))}
          </div>
        </div>
      </main>
      <CreateHabitDialog />
    </>
  );
}
