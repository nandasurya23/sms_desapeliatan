import { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { createTransaction, getTransactionHistory, TransactionItem } from "@/services/transaction";

export default function TransactionScreen() {
  const [transactionId, setTransactionId] = useState("");
  const [transactionValue, setTransactionValue] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [history, setHistory] = useState<TransactionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    setLoadingHistory(true);
    setError("");

    const result = await getTransactionHistory("me");
    if (typeof result === "string") {
      setError(result);
      setHistory([]);
    } else {
      setHistory(result);
    }

    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async () => {
    if (!transactionId.trim() || !transactionValue.trim()) {
      Alert.alert("Error", "transaction_id dan transaction_value wajib diisi");
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await createTransaction({
        transaction_id: transactionId.trim(),
        transaction_value: transactionValue.trim(),
        ...(transactionDate.trim() ? { transaction_date: transactionDate.trim() } : {}),
      });

      Alert.alert("Sukses", "Transaksi berhasil disimpan");
      setTransactionId("");
      setTransactionValue("");
      setTransactionDate("");
      await loadHistory();
    } catch (err) {
      const status = err instanceof Error ? (err as Error & { status?: number }).status : undefined;
      const message = err instanceof Error ? err.message : "Gagal menyimpan transaksi";
      if (status === 409 || /duplicate|duplikat/i.test(message)) {
        setError("transaction_id sudah digunakan. Pakai ID transaksi yang berbeda.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-4 pt-6 pb-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Transaction</Text>
        <Text className="text-gray-500 mt-1">Create transaksi dan lihat history milik akun saat ini.</Text>
      </View>

      <View className="px-4 pt-4">
        {error ? (
          <View className="bg-red-100 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-red-700">{error}</Text>
          </View>
        ) : null}

        <View className="bg-white rounded-2xl p-4 border border-gray-200">
          <Text className="text-gray-700 font-medium mb-2">transaction_id</Text>
          <TextInput
            value={transactionId}
            onChangeText={setTransactionId}
            placeholder="Contoh: TRX-001"
            className="bg-gray-50 rounded-xl px-4 py-3 mb-4"
            autoCapitalize="characters"
          />

          <Text className="text-gray-700 font-medium mb-2">transaction_value</Text>
          <TextInput
            value={transactionValue}
            onChangeText={setTransactionValue}
            placeholder="Contoh: 15000"
            keyboardType="numeric"
            className="bg-gray-50 rounded-xl px-4 py-3 mb-4"
          />

          <Text className="text-gray-700 font-medium mb-2">transaction_date</Text>
          <TextInput
            value={transactionDate}
            onChangeText={setTransactionDate}
            placeholder="YYYY-MM-DD (opsional)"
            className="bg-gray-50 rounded-xl px-4 py-3 mb-4"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`bg-emerald-500 rounded-xl py-3 items-center justify-center ${submitting ? "opacity-50" : ""}`}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Simpan Transaksi</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-5">
          <Text className="text-lg font-bold text-gray-800 mb-3">History</Text>
          {loadingHistory ? (
            <View className="bg-white rounded-xl p-4 items-center">
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item, index) => String(item.id ?? item.transaction_id ?? index)}
              renderItem={({ item }) => (
                <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-800 font-bold">{item.transaction_id}</Text>
                    <Text className="text-emerald-600 font-bold">{String(item.transaction_value)}</Text>
                  </View>
                  {item.transaction_date ? (
                    <Text className="text-gray-500 mt-2">{item.transaction_date}</Text>
                  ) : null}
                </View>
              )}
              ListEmptyComponent={
                <View className="bg-white rounded-xl p-4 items-center border border-gray-200">
                  <Text className="text-gray-500">Belum ada history transaksi</Text>
                </View>
              }
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
