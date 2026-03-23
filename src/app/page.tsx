import { CreateHabitDialog } from "@/presentation/components/create-habit-dialog";
import { HabitCard } from "@/presentation/components/habit-card";
import { HomeHeader } from "@/presentation/components/home-header";
import { MOCK_HABITS } from "@/presentation/data/mock-habits";

export default function Home() {
  return (
    <>
      <main className="flex flex-col pb-24">
        <div
          className="mx-auto flex w-full flex-col gap-6 px-4 pb-6 md:px-6 lg:max-w-4xl lg:px-8 xl:px-10"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
          }}
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
