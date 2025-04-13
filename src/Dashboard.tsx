import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const Dashboard = () => {
  const [foodEntries, setFoodEntries] = useState([]);

  useEffect(() => {
    const fetchFood = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Not authenticated:", authError);
        return;
      }

      const { data, error } = await supabase
        .from("food")
        .select("*")
        .eq("user_id", user.id);

      if (error) console.error(error);
      else setFoodEntries(data);
    };

    fetchFood();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Calovate 🍽️</h1>
      <h2 className="text-xl mb-2">Your Food Entries</h2>
      <ul className="space-y-2">
        {foodEntries.map((item) => (
          <li key={item.id} className="bg-gray-100 p-3 rounded shadow">
            <strong>{item.name}</strong> - {item.calories} cal
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
