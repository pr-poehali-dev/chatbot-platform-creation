import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockBots } from './marketplace/mockBots';
import { categories } from './marketplace/types';
import BotCard from './marketplace/BotCard';
import CategoryFilter from './marketplace/CategoryFilter';
import SearchBar from './marketplace/SearchBar';

const BotMarketplace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBots = mockBots.filter((bot) => {
    const matchesCategory = selectedCategory === 'Все' || bot.category === selectedCategory;
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuy = (id: number) => {
    navigate(`/bot/${id}`);
  };

  const handleRent = (id: number) => {
    navigate(`/bot/${id}?mode=rent`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Маркетплейс готовых решений</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Выберите готового бота или создайте своего с нуля
        </p>
      </div>

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CategoryFilter 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredBots.map((bot) => (
          <BotCard 
            key={bot.id} 
            bot={bot} 
            onBuy={handleBuy} 
            onRent={handleRent} 
          />
        ))}
      </div>

      {filteredBots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm md:text-base">
            Ботов не найдено. Попробуйте изменить фильтры.
          </p>
        </div>
      )}
    </div>
  );
};

export default BotMarketplace;
