Dishlist::Application.routes.draw do

  root 'page#home'

  match '/dishlist', to: 'page#list', via: [:get]
  match '/friends', to: 'page#friends', via: [:get]
  match '/restaurant/:restaurant/:id', to: 'page#restaurant', via: [:get], as: "restaurant"
  match '/user/:username', to: 'page#user', via: [:get], as: "user"

  match '/search', to: 'page#search', via: [:get]

  match '/logout', to: 'user#logout', via: [:delete]
  match '/login', to: 'user#login', via: [:get]
  match '/signup', to: 'user#new', via: [:get]
  match '/usercreate', to: 'user#create', via: [:post]
  match '/loginattempt', to: 'user#loginattempt', via: [:post, :patch]

  #devise_for :users

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
