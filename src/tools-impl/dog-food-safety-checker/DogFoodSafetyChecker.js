"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, ShieldCheck, ShieldAlert, AlertOctagon, 
  Info, X, ChevronRight, Bone
} from "lucide-react";

const FOOD_DATABASE = [
  // ================= TOXIC FOODS =================
  { id: "chocolate", name: "Chocolate", status: "toxic", desc: "Contains theobromine and caffeine, which dogs cannot metabolize.", details: "Strictly avoid all types. Dark chocolate and baking cocoa are the most deadly.", symptoms: "Vomiting, diarrhea, rapid breathing, seizures, or death." },
  { id: "grapes", name: "Grapes & Raisins", status: "toxic", desc: "Highly toxic and can cause sudden, acute kidney failure.", details: "Even a small amount can be fatal. The toxic substance is unknown.", symptoms: "Lethargy, vomiting, diarrhea, abdominal pain, kidney failure." },
  { id: "onions", name: "Onions & Garlic", status: "toxic", desc: "Destroys a dog's red blood cells, leading to severe anemia.", details: "All forms are toxic: raw, cooked, powdered, or dehydrated.", symptoms: "Weakness, vomiting, breathing difficulties, pale gums." },
  { id: "macadamia", name: "Macadamia Nuts", status: "toxic", desc: "Among the most poisonous foods for dogs.", details: "Do not feed even a single nut. Often found in cookies.", symptoms: "Weakness in back legs, vomiting, tremors, hyperthermia." },
  { id: "xylitol", name: "Xylitol (Artificial Sweetener)", status: "toxic", desc: "Deadly additive found in gum, candy, and some peanut butters.", details: "Causes a massive insulin release leading to deadly hypoglycemia and liver failure.", symptoms: "Vomiting, weakness, staggering, collapse, seizures within minutes." },
  { id: "avocado", name: "Avocado", status: "toxic", desc: "Contains persin, a fungicidal toxin.", details: "The pit is a severe choking hazard, and the flesh causes digestive issues.", symptoms: "Vomiting, diarrhea, myocardial damage." },
  { id: "alcohol", name: "Alcohol", status: "toxic", desc: "Dogs are highly sensitive to ethanol and hops.", details: "Even tiny amounts of alcohol or unbaked yeast dough can be lethal.", symptoms: "Vomiting, coordination loss, central nervous system depression, death." },
  { id: "coffee", name: "Coffee & Caffeine", status: "toxic", desc: "Caffeine is a methylxanthine, similar to the toxin in chocolate.", details: "Keep all coffee grounds, tea bags, and energy drinks away.", symptoms: "Restlessness, rapid breathing, heart palpitations, muscle tremors." },
  { id: "cherries", name: "Cherries", status: "toxic", desc: "The pit, stem, and leaves contain cyanide.", details: "The fleshy part is safe, but it's not worth the risk of cyanide poisoning or intestinal blockage.", symptoms: "Dilated pupils, difficulty breathing, red gums." },
  { id: "raw_potatoes", name: "Raw Potatoes", status: "toxic", desc: "Contains solanine, a compound that is toxic to dogs.", details: "Never feed raw potatoes or potato plants. (Cooked, plain potatoes are safe).", symptoms: "Nausea, vomiting, irregular heartbeats." },
  { id: "green_tomatoes", name: "Green Tomatoes", status: "toxic", desc: "Contains tomatine, a toxic alkaloid.", details: "The green parts of the tomato plant and unripe tomatoes are dangerous. Ripe red tomatoes are generally safe.", symptoms: "Gastrointestinal upset, weakness, tremors." },
  { id: "walnuts", name: "Walnuts", status: "toxic", desc: "Prone to a specific type of mold containing tremorgenic mycotoxins.", details: "Black walnuts are especially dangerous and can cause severe neurological issues.", symptoms: "Muscle tremors, seizures, lethargy, vomiting." },
  { id: "nutmeg", name: "Nutmeg", status: "toxic", desc: "Contains myristicin, which is toxic to dogs in large amounts.", details: "Keep holiday baked goods out of reach.", symptoms: "Hallucinations, increased heart rate, high blood pressure, seizures." },
  
  // ================= SAFE FOODS =================
  { id: "apples", name: "Apples", status: "safe", desc: "Excellent source of vitamins A and C, and fiber.", details: "Wash thoroughly. MUST remove the core and all seeds before feeding.", symptoms: "Seeds contain trace cyanide." },
  { id: "chicken", name: "Chicken", status: "safe", desc: "Excellent source of protein, often used for upset stomachs.", details: "Must be thoroughly cooked, unseasoned, and entirely BONELESS.", symptoms: "" },
  { id: "carrots", name: "Carrots", status: "safe", desc: "Great low-calorie snack high in fiber and beta-carotene.", details: "Can be served raw or cooked. Crunching raw carrots helps clean teeth.", symptoms: "" },
  { id: "peanut_butter", name: "Peanut Butter", status: "safe", desc: "Packed with protein and healthy fats.", details: "CRITICAL: Must NOT contain Xylitol. Choose raw, unsalted varieties.", symptoms: "" },
  { id: "bananas", name: "Bananas", status: "safe", desc: "Great treat rich in potassium, vitamins, and biotin.", details: "High in sugar; feed in moderation as an occasional treat.", symptoms: "" },
  { id: "blueberries", name: "Blueberries", status: "safe", desc: "A superfood rich in antioxidants, which prevent cell damage.", details: "Can be fed raw or frozen. Great alternative to store-bought treats.", symptoms: "" },
  { id: "watermelon", name: "Watermelon", status: "safe", desc: "Full of vitamins and 92% water, great for hydration.", details: "Must remove the rind and seeds to prevent intestinal blockages.", symptoms: "" },
  { id: "sweet_potatoes", name: "Sweet Potatoes", status: "safe", desc: "High in dietary fiber, vitamins B6 and C.", details: "Must be cooked and unseasoned. Raw sweet potatoes are hard to digest.", symptoms: "" },
  { id: "pumpkin", name: "Pumpkin", status: "safe", desc: "Excellent for digestion; helps with both diarrhea and constipation.", details: "Use plain, pureed pumpkin (NOT pumpkin pie filling with spices).", symptoms: "" },
  { id: "rice", name: "White Rice", status: "safe", desc: "Easy to digest and great for dogs with an upset stomach.", details: "Serve plain and boiled. Often mixed with boiled chicken for sick dogs.", symptoms: "" },
  { id: "salmon", name: "Salmon", status: "safe", desc: "Rich in omega-3 fatty acids, which keep coats healthy.", details: "Must be fully cooked and boneless. NEVER feed raw salmon (salmon poisoning risk).", symptoms: "" },
  { id: "green_beans", name: "Green Beans", status: "safe", desc: "Full of iron and vitamins, and low in calories.", details: "Can be raw, steamed, or canned (must be unsalted).", symptoms: "" },
  { id: "cucumbers", name: "Cucumbers", status: "safe", desc: "Perfect for overweight dogs, holds little to no carbs or fats.", details: "Loaded with vitamins K, C, and B1. Great crunch.", symptoms: "" },
  { id: "strawberries", name: "Strawberries", status: "safe", desc: "Full of fiber and vitamin C.", details: "Contain an enzyme that can help whiten a dog's teeth. Feed in moderation due to sugar.", symptoms: "" },
  { id: "pineapple", name: "Pineapple", status: "safe", desc: "Full of vitamins, minerals, and bromelain (helps absorb proteins).", details: "Remove the prickly outside and crown. Feed in small amounts (high sugar).", symptoms: "" },
  { id: "beef", name: "Beef", status: "safe", desc: "A common ingredient in dog food, high in protein.", details: "Lean cuts are best. Ensure it's cooked without toxic seasonings (garlic/onion).", symptoms: "" },
  { id: "turkey", name: "Turkey", status: "safe", desc: "Fine for dogs, but must be plain and unseasoned.", details: "Remove excess fat and skin. Never give turkey bones.", symptoms: "" },
  { id: "eggs", name: "Eggs", status: "safe", desc: "Great source of protein, riboflavin, and selenium.", details: "Must be fully cooked. Raw eggs risk Salmonella and biotin deficiency.", symptoms: "" },
  { id: "peas", name: "Peas", status: "safe", desc: "Green, snow, and sugar snap peas are all okay.", details: "Fresh or frozen are best. Avoid canned peas with added sodium.", symptoms: "" },
  { id: "spinach", name: "Spinach", status: "safe", desc: "High in iron and vitamins.", details: "Contains oxalic acid, which blocks calcium absorption, so feed in small amounts.", symptoms: "" },
  { id: "mango", name: "Mango", status: "safe", desc: "Packed with four different vitamins: A, B6, C, and E.", details: "Remove the hard pit completely. Feed in moderation.", symptoms: "" },
  { id: "peaches", name: "Peaches", status: "safe", desc: "Great source of vitamin A and fiber.", details: "The pit contains cyanide and is a choking hazard. Feed only the flesh.", symptoms: "" },
  { id: "pears", name: "Pears", status: "safe", desc: "Rich in copper, vitamins C and K, and fiber.", details: "Remove the pit and seeds (contains trace cyanide). Cut into bite-sized chunks.", symptoms: "" },
  { id: "raspberries", name: "Raspberries", status: "safe", desc: "Fine in moderation. Contain antioxidants.", details: "They contain trace amounts of natural xylitol, so limit to a cup at a time.", symptoms: "" },
  { id: "cantaloupe", name: "Cantaloupe", status: "safe", desc: "Packed with nutrients, low in calories.", details: "High in sugar. Feed the flesh only, no seeds or rind.", symptoms: "" },
  { id: "celery", name: "Celery", status: "safe", desc: "Promotes a healthy heart and can freshen doggy breath.", details: "Cut into small, chewable pieces to prevent choking.", symptoms: "" },
  
  // ================= CAUTION (Moderate Risk / Small Amounts) =================
  { id: "cheese", name: "Cheese", status: "caution", desc: "Safe in small quantities, but many dogs are lactose intolerant.", details: "Use low-fat varieties like cottage cheese or mozzarella. Avoid blue cheeses.", symptoms: "Gas, diarrhea, or vomiting if the dog is lactose intolerant." },
  { id: "milk", name: "Milk / Dairy", status: "caution", desc: "Dogs have low levels of lactase to break down milk sugars.", details: "A few licks are okay, but an entire bowl will cause severe digestive distress.", symptoms: "Diarrhea, vomiting, loose stools." },
  { id: "almonds", name: "Almonds", status: "caution", desc: "Not toxic like macadamia nuts, but can block the esophagus.", details: "Salted almonds cause water retention. Not recommended due to choking hazard.", symptoms: "Choking, gastrointestinal tears, vomiting." },
  { id: "cashews", name: "Cashews", status: "caution", desc: "Okay in very small amounts.", details: "High in fat, which can lead to weight gain and pancreatitis. Must be unsalted.", symptoms: "Stomach upset if fed too many." },
  { id: "bread", name: "Bread", status: "caution", desc: "Plain white or wheat bread is generally safe.", details: "Offers no nutritional value. NEVER feed raw dough (yeast expands and creates alcohol).", symptoms: "Raw dough causes severe bloating and alcohol poisoning." },
  { id: "honey", name: "Honey", status: "caution", desc: "Packed with nutrients and natural sugars.", details: "Only give in tiny amounts due to high sugar content. Do not feed to puppies or immune-compromised dogs.", symptoms: "Weight gain, tooth decay." },
  { id: "cinnamon", name: "Cinnamon", status: "caution", desc: "Not toxic, but can irritate the inside of a dog's mouth.", details: "Can lower blood sugar too much in large quantities. Best avoided.", symptoms: "Coughing, choking, difficulty breathing." },
  { id: "salt", name: "Salt / Salty Snacks", status: "caution", desc: "Can lead to sodium ion poisoning.", details: "Keep chips and pretzels away. Dogs require very little salt in their diet.", symptoms: "Excessive thirst, urination, vomiting, tremors, seizures." },
  { id: "tomatoes", name: "Tomatoes (Ripe)", status: "caution", desc: "Ripe, red tomatoes are generally safe.", details: "Must be completely ripe. The green parts (stems/leaves) are highly toxic.", symptoms: "If green parts eaten: lethargy, weakness, confusion." },
  { id: "mushrooms", name: "Mushrooms (Store-bought)", status: "caution", desc: "Washed, plain white button mushrooms from the store are okay.", details: "Wild mushrooms can be deadly. It's often safer to avoid mushrooms altogether.", symptoms: "Wild mushrooms cause liver failure, seizures, death." },
  { id: "pork", name: "Pork / Bacon", status: "caution", desc: "Highly fatty and heavily processed.", details: "Bacon and ham can cause pancreatitis due to high fat and salt. Plain, lean cooked pork is okay.", symptoms: "Pancreatitis, severe vomiting, diarrhea." },
  { id: "corn", name: "Corn on the Cob", status: "caution", desc: "The corn itself is safe, but the cob is extremely dangerous.", details: "Cobs do not digest and cause fatal intestinal blockages.", symptoms: "Vomiting, straining to defecate, loss of appetite." },
  { id: "hotdogs", name: "Hot Dogs", status: "caution", desc: "Technically safe, but highly processed and full of sodium.", details: "Not a healthy treat. Cut into tiny pieces if used for high-value training.", symptoms: "Digestive upset due to high fat/salt." }
];

export default function DogFoodSafetyChecker() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            food.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "all" || food.status === activeFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, activeFilter]);

  const getStatusConfig = (status) => {
    switch(status) {
      case "safe": 
        return { icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", label: "Safe to Eat" };
      case "caution": 
        return { icon: AlertOctagon, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", label: "Use Caution" };
      case "toxic": 
        return { icon: ShieldAlert, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800", label: "Highly Toxic" };
      default: 
        return { icon: Info, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Unknown" };
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl shadow-inner">
            <Bone className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Can My Dog Eat This?
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart Food Safety & Toxicity Database
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6 items-start">
        
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an ingredient (e.g., Apple, Chocolate, Cheese)..."
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Foods", icon: Info },
              { id: "safe", label: "Safe", icon: ShieldCheck },
              { id: "caution", label: "Caution", icon: AlertOctagon },
              { id: "toxic", label: "Toxic", icon: ShieldAlert }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeFilter === f.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
              >
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>

          {filteredFoods.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-500">No foods found matching your criteria.</p>
              <button onClick={() => {setSearchQuery(""); setActiveFilter("all");}} className="text-xs font-bold text-indigo-500 hover:underline">Clear Search</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-10">
              {filteredFoods.map((food) => {
                const config = getStatusConfig(food.status);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition-all shadow-sm group flex flex-col justify-between ${
                      selectedFood?.id === food.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{food.name}</h3>
                        <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${config.bg} ${config.color} ${config.border}`}>
                          <Icon className="w-3 h-3" /> {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                        {food.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-[10px] font-bold text-indigo-500 uppercase tracking-wider group-hover:text-indigo-600">
                      View Details <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky top-6">
          {selectedFood ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-right-4">
              <div className={`p-5 ${getStatusConfig(selectedFood.status).bg} border-b ${getStatusConfig(selectedFood.status).border} flex justify-between items-start`}>
                <div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1 ${getStatusConfig(selectedFood.status).color}`}>
                    {React.createElement(getStatusConfig(selectedFood.status).icon, { className: "w-4 h-4" })}
                    {getStatusConfig(selectedFood.status).label}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{selectedFood.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedFood(null)}
                  className="p-1.5 bg-white/50 dark:bg-slate-900/50 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Overview</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedFood.desc}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" /> Preparation / Guidelines
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedFood.details}
                  </p>
                </div>

                {selectedFood.symptoms && (
                  <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                    <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Toxicity Symptoms
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                      {selectedFood.symptoms}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl h-[400px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Bone className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold text-slate-500">Select a food item to view detailed safety guidelines, preparation tips, and risk symptoms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}