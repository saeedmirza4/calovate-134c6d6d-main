import { useState } from "react";
import { supabase } from "./supabaseClient";


const FoodEntry = () => {
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    sugar: "",
    fat: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("food").insert([
      {
        ...form,
        calories: parseInt(form.calories),
        protein: parseFloat(form.protein),
        carbs: parseFloat(form.carbs),
        sugar: parseFloat(form.sugar),
        fat: parseFloat(form.fat),
        user_id: user.id,
        date: new Date()
      },
    ]);

    if (error) alert("Error adding food: " + error.message);
    else alert("Food added!");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Food Entry</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "calories", "protein", "carbs", "sugar", "fat"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
            className="w-full p-2 border rounded"
          />
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Food</button>
      </form>
    </div>
  );
};

export default FoodEntry;
